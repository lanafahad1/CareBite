// Member space (personal accounts outside the hospital): food profile → meals that
// fit, favourites, food diary with leftovers, the week, portion learning, and the
// wall between members and the hospital.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryRepo } from '../domain/memory-repo.js';
import { createService } from '../domain/service.js';
import { seedCatalog, seedHospitalDemo, seedMemberDemo } from '../domain/demo-data.js';
import { addDays } from '../domain/dates.js';
import { forMember } from '../domain/member.js';

let repo; let service; let ids; let today;
const actor = (role, id, extra = {}) => ({ id, role, name: id, status: 'active', ...extra });
const admin = actor('admin', 'admin-1');
const staff = actor('staff', 'staff-1');
let sara; let omar;
const asPatient = () => actor('patient', 'pt-1', { patientId: ids['CB-1001'] });

beforeEach(() => {
  repo = createMemoryRepo();
  seedCatalog(repo, new Date().toISOString());
  service = createService({ repo });
  today = service.today();
  ids = seedHospitalDemo({ repo, service, today });
  sara = repo.createUser({ username: 'sara.member', email: 'sara@carebite.test', name: 'Sara', role: 'member', status: 'active', isDemo: true });
  omar = repo.createUser({ username: 'omar', email: 'omar@carebite.test', name: 'Omar', role: 'member', status: 'active' });
});
const me = () => actor('member', sara.id);
const other = () => actor('member', omar.id);
const PROFILE = {
  allergies: { status: 'recorded', confirmed: ['sesame'] },
  intolerances: { selected: ['lactose'] },
  preferences: { cuisines: ['Saudi'], favorites: ['chicken'], dislikes: ['eggplant'], preferredPortion: 'regular' },
  appetite: 'good',
};

test('an empty profile asks the member to fill it in before any meal is shown', () => {
  const r = service.mealsForYou(me(), {});
  assert.equal(r.hasProfile, false);
  assert.equal(r.meals.length, 0);
  assert.equal(service.getMemberProfile(me()).hasProfile, false);
});

test('the profile must say whether the member has allergies, and is stored self-reported only', () => {
  assert.throws(() => service.saveMemberProfile(me(), { allergies: {} }), (e) => e.status === 422 && Boolean(e.details.errors['allergies.status']));
  assert.throws(() => service.saveMemberProfile(me(), { allergies: { status: 'recorded' } }), (e) => e.status === 422);
  const r = service.saveMemberProfile(me(), { ...PROFILE, dietOrder: { categories: ['renal'] }, allergies: { status: 'recorded', confirmed: ['sesame'], uncoded: ['prawns', 'dragon fruit'] } });
  assert.deepEqual(r.profile.allergies.confirmed, ['sesame', 'shellfish'], 'free text is coded where possible');
  assert.deepEqual(r.profile.allergies.uncoded, ['dragon fruit']);
  assert.equal(r.profile.dietOrder, undefined, 'members cannot set a diet order');
  assert.match(r.notice, /doesn’t replace medical advice/);
});

test('meals for you: allergies and intolerances hide meals, the rest are explained in "you" wording', () => {
  service.saveMemberProfile(me(), PROFILE);
  const r = service.mealsForYou(me(), { period: 'lunch' });
  assert.equal(r.hasProfile, true);
  assert.ok(r.meals.length > 0, 'some lunches fit');
  assert.ok(r.counts.hidden > 0, 'some lunches are hidden');
  assert.equal(r.counts.fits + r.counts.check + r.counts.hidden, service.catalog().list.filter((m) => m.category === 'lunch' && m.available).length);
  for (const m of r.meals) {
    assert.equal(m.category, 'lunch');
    assert.ok(!m.allergens.contains.includes('sesame') && !m.allergens.mayContain.includes('sesame'), `${m.name} has no sesame`);
    assert.ok(m.portion.suggested && m.portion.explanation);
    assert.match(m.why.checked, /sesame allergy/);
    const text = [m.portion.explanation, ...m.why.reasons].join(' ');
    assert.doesNotMatch(text, /patient|nutrition team|approved/i);
  }
  // A text allergy that cannot be coded: meals become "check the ingredients yourself", never "fits".
  service.saveMemberProfile(me(), { ...PROFILE, allergies: { status: 'recorded', uncoded: ['dragon fruit'] } });
  const r2 = service.mealsForYou(me(), { period: 'lunch' });
  assert.equal(r2.meals.length, 0);
  assert.ok(r2.check.length > 0);
  assert.match(r2.check[0].why.review[0], /check this meal’s ingredients for it yourself/i);
});

test('favourites come first and can be removed', () => {
  service.saveMemberProfile(me(), PROFILE);
  const before = service.mealsForYou(me(), { period: 'dinner' });
  const last = before.meals.at(-1);
  service.setFavorite(me(), last.id, true);
  const after = service.mealsForYou(me(), { period: 'dinner' });
  assert.equal(after.meals[0].id, last.id);
  assert.equal(after.meals[0].favorite, true);
  assert.deepEqual(service.setFavorite(me(), last.id, false).favorites, []);
  assert.throws(() => service.setFavorite(me(), 'no-such-meal', true), (e) => e.status === 404);
});

test('my day: kcal eaten and leftovers; the week sums the days and lists the top reasons', () => {
  service.saveMemberProfile(me(), PROFILE);
  const lunch = service.mealsForYou(me(), { period: 'lunch' }).meals.find((m) => m.nutrition.kcal);
  const kcal = service.catalog().byId[lunch.id].nutrition.perServing.kcal;
  const a = service.addMemberLog(me(), { date: today, period: 'lunch', mealId: lunch.id, portion: 'large', amount: 'most', reasons: ['portion-too-large'] }).entry;
  assert.equal(a.kcalServed, Math.round(kcal * 1.5));
  assert.equal(a.kcalEaten, Math.round(a.kcalServed * 0.75));
  assert.equal(a.leftoverShare, 25);
  service.addMemberLog(me(), { date: today, period: 'snack', name: 'Apple', kcal: 80, amount: 'all', reasons: ['taste'] });
  service.addMemberLog(me(), { date: addDays(today, -2), period: 'dinner', name: 'Soup', kcal: 200, amount: 'none', reasons: ['low-appetite'] });
  const day = service.getMemberDay(me(), { date: today });
  assert.equal(day.entries.length, 2);
  assert.deepEqual(day.entries.find((e) => e.name === 'Apple').reasons, [], 'eating all of it leaves no leftover reason');
  assert.equal(day.totals.kcalEaten, a.kcalEaten + 80);
  assert.equal(day.totals.leftoverShare, Math.round((1 - (0.75 + 1) / 2) * 100));
  const week = service.getMemberWeek(me(), {});
  assert.equal(week.days.length, 7);
  assert.equal(week.days.at(-1).date, today);
  assert.equal(week.daysLogged, 2);
  assert.equal(week.days.at(-3).kcalEaten, 0);
  assert.equal(week.leftoverShare, Math.round((1 - (0.75 + 1 + 0) / 3) * 100));
  assert.deepEqual(week.reasons.map((r) => r.id).sort(), ['low-appetite', 'portion-too-large']);
  // Edits and deletes.
  const upd = service.updateMemberLog(me(), a.id, { amount: 'all' }).entry;
  assert.equal(upd.kcalEaten, upd.kcalServed);
  assert.deepEqual(upd.reasons, []);
  service.deleteMemberLog(me(), a.id);
  assert.equal(service.getMemberDay(me(), { date: today }).entries.length, 1);
  // Validation.
  assert.throws(() => service.addMemberLog(me(), { date: addDays(today, 1), period: 'lunch', name: 'x', kcal: 1, amount: 'all' }), (e) => e.status === 409);
  assert.throws(() => service.addMemberLog(me(), { date: today, period: 'lunch', name: '', kcal: 'lots', amount: 'all' }), (e) => e.status === 422 && Boolean(e.details.errors.name && e.details.errors.kcal));
  assert.throws(() => service.addMemberLog(me(), { date: today, period: 'brunch', name: 'x', kcal: 1, amount: 'all' }), (e) => e.status === 422);
});

test('portions that were "too big" make the next suggestion smaller (right-sized portions)', () => {
  service.saveMemberProfile(me(), PROFILE);
  const first = service.mealsForYou(me(), { period: 'lunch' }).meals[0];
  assert.equal(first.portion.suggested, 'regular');
  service.addMemberLog(me(), { date: addDays(today, -1), period: 'lunch', mealId: first.id, portion: 'regular', amount: 'some', reasons: ['portion-too-large'] });
  const after = service.mealsForYou(me(), { period: 'lunch' }).meals[0];
  assert.equal(after.portion.suggested, 'small');
  assert.match(after.portion.explanation, /you recently said portions were too big/);
});

test('members see only their own data; hospital roles get 403 and members get 403 on hospital data', () => {
  service.saveMemberProfile(me(), PROFILE);
  const e = service.addMemberLog(me(), { date: today, period: 'snack', name: 'Dates', kcal: 70, amount: 'all' }).entry;
  assert.equal(service.getMemberDay(other(), { date: today }).entries.length, 0, 'another member sees nothing');
  assert.equal(service.getMemberProfile(other()).hasProfile, false);
  assert.throws(() => service.updateMemberLog(other(), e.id, { amount: 'none' }), (x) => x.status === 404);
  assert.throws(() => service.deleteMemberLog(other(), e.id), (x) => x.status === 404);
  for (const who of [admin, staff, asPatient()]) {
    assert.throws(() => service.getMemberProfile(who), (x) => x.status === 403, who.role);
    assert.throws(() => service.getMemberDay(who, {}), (x) => x.status === 403, who.role);
    assert.throws(() => service.mealsForYou(who, {}), (x) => x.status === 403, who.role);
  }
  assert.throws(() => service.listPatients(me()), (x) => x.status === 403);
  assert.throws(() => service.getPatient(me(), ids['CB-1001']), (x) => x.status === 403);
  assert.throws(() => service.getKitchenSummary(me(), {}), (x) => x.status === 403);
  assert.throws(() => service.listStaff(me()), (x) => x.status === 403);
  // Members are never listed as staff, and an admin cannot "approve" them.
  const staffList = service.listStaff(admin);
  assert.ok(![...staffList.pending, ...staffList.staff].some((u) => u.role === 'member'));
  assert.throws(() => service.decideStaff(admin, omar.id, { decision: 'role', role: 'staff' }), (x) => x.status === 404);
  // Nothing about members reaches the audit log that staff can read.
  const audit = repo.listAudit({ limit: 5000 });
  assert.ok(!audit.some((a) => a.actorRole === 'member' || [sara.id, omar.id].includes(a.actorId) || /sara\.member|@omar/.test(a.detail)));
  // Their export includes their own documents.
  const out = service.exportData(me(), { ...sara });
  assert.equal(out.foodDiary.length, 1);
  assert.deepEqual(out.foodProfile.allergies.confirmed, ['sesame']);
});

test('the demo member seed restores only her own documents', () => {
  service.saveMemberProfile(other(), PROFILE);
  service.addMemberLog(me(), { date: today, period: 'snack', name: 'Extra', kcal: 10, amount: 'all' });
  seedMemberDemo({ repo, service, today });
  const day = service.getMemberDay(me(), { date: addDays(today, -1) });
  assert.ok(day.entries.length >= 3);
  assert.ok(!service.getMemberDay(me(), { date: today }).entries.some((e) => e.name === 'Extra'), 'her own later entries are reset');
  assert.equal(service.getMemberProfile(other()).hasProfile, true, 'other members keep their data');
  const meals = service.mealsForYou(me(), { period: 'lunch' });
  assert.ok(meals.meals.length && meals.favorites.length);
  assert.equal(meals.meals[0].favorite, true);
});

test('member wording never mentions the patient or the nutrition team', () => {
  assert.equal(forMember('Regular portion suggested because it matches the patient’s preferred regular portion.'), 'Regular portion suggested because it matches your preferred regular portion.');
  assert.equal(forMember('Includes foods the patient enjoys: chicken.'), 'Includes foods you enjoy: chicken.');
});
