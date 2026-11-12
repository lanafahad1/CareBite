// Member space: personal accounts outside the hospital ("member" role).
//
//   My food profile  — self-reported allergies, intolerances, likes, dislikes,
//                      cuisines, usual appetite and preferred portion. No diet
//                      orders or medical diets: members cannot prescribe for themselves.
//   Meals for you    — the same rule-based engine as the hospital, run over the
//                      CareBite menu with a regular diet and the member's profile.
//   My day           — a simple food diary: what was served, how much was eaten,
//                      why food was left, calories eaten and the week's leftovers.
//                      Entries feed back into "Meals for you" (portion suggestions).
//
// Every method needs the 'member:own' permission and works only on the signed-in
// member's own documents (MemberDocs, keyed by the account id). Hospital roles
// never reach this data, and nothing here is written to the AuditLog.

import { recommend } from './engine.js';
import { emptyPatient, codeFreeText, clean } from './patient.js';
import { ALLERGENS, INTOLERANCES, CUISINES, PORTIONS, APPETITE, PERIODS, PERIOD_IDS, INTAKE_AMOUNTS, MEMBER_REASONS, MEMBER_AMOUNTS, MEMBER_APPETITE, portionFactor, label } from './constants.js';
import { addDays } from './dates.js';

export { MEMBER_REASONS, MEMBER_AMOUNTS, MEMBER_APPETITE };

export const MEMBER_NOTICE = 'Your food profile is self-reported. CareBite checks meals against what you tell us, but it doesn’t replace medical advice. If you have a medical condition or a prescribed diet, follow your doctor or dietitian.';

const LOG_DAYS_BACK = 365;
const MAX_PER_DAY = 30;
const INTAKE_WINDOW = 28; // days of diary entries that tune portion suggestions
const ids = (list) => new Set(list.map((x) => x.id));
const SETS = { allergens: ids(ALLERGENS), intolerances: ids(INTOLERANCES), cuisines: new Set(CUISINES), portions: ids(PORTIONS), appetite: ids(APPETITE), amounts: ids(INTAKE_AMOUNTS), reasons: ids(MEMBER_REASONS) };
const strList = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]).map((x) => String(x).trim()).filter(Boolean);
const pick = (v, set) => [...new Set(strList(v).filter((x) => set.has(x)))];
const shareOf = (amount) => INTAKE_AMOUNTS.find((a) => a.id === amount)?.share ?? 0;

export const emptyProfile = () => ({
  allergies: { status: 'nka', confirmed: [], ingredients: [], uncoded: [] },
  intolerances: { selected: [], ingredients: [], uncoded: [] },
  preferences: { cuisines: [], favorites: [], dislikes: [], preferredPortion: 'regular' },
  appetite: 'good',
});

/**
 * Validate a self-reported food profile. Free text is coded to an allergen group or
 * ingredients when possible (as for patients); what cannot be coded is kept and the
 * member is asked to check those meals themselves.
 */
export function normalizeProfile(input = {}, ingredients = {}) {
  const errors = {};
  const warnings = [];
  const known = new Set(Object.keys(ingredients));
  const a = input.allergies ?? {};
  const status = a.status === 'nka' || a.status === 'recorded' ? a.status : null;
  const allergies = { status: status ?? 'nka', confirmed: [], ingredients: [], uncoded: [] };
  if (!status) errors['allergies.status'] = 'Tell us whether you have any food allergies.';
  if (status === 'recorded') {
    allergies.confirmed = pick(a.confirmed, SETS.allergens);
    allergies.ingredients = pick(a.ingredients, known);
    for (const text of strList(a.uncoded).map((t) => clean(t, 60)).filter(Boolean).slice(0, 20)) {
      const coded = codeFreeText(text, ingredients);
      if (coded.group) { if (!allergies.confirmed.includes(coded.group)) allergies.confirmed.push(coded.group); } else if (coded.ingredients.length) allergies.ingredients.push(...coded.ingredients.filter((i) => !allergies.ingredients.includes(i)));
      else if (!allergies.uncoded.includes(text)) allergies.uncoded.push(text);
    }
    if (!allergies.confirmed.length && !allergies.ingredients.length && !allergies.uncoded.length) errors['allergies.status'] = 'Add your allergies, or choose “No known food allergies”.';
  }
  const it = input.intolerances ?? {};
  const intolerances = { selected: pick(it.selected, SETS.intolerances), ingredients: pick(it.ingredients, known), uncoded: [] };
  for (const text of strList(it.uncoded).map((t) => clean(t, 60)).filter(Boolean).slice(0, 20)) {
    const coded = codeFreeText(text, ingredients);
    if (coded.ingredients.length) intolerances.ingredients.push(...coded.ingredients.filter((i) => !intolerances.ingredients.includes(i)));
    else if (!intolerances.uncoded.includes(text)) intolerances.uncoded.push(text);
  }
  const p = input.preferences ?? {};
  const preferences = {
    cuisines: pick(p.cuisines, SETS.cuisines),
    favorites: pick(p.favorites, known),
    dislikes: pick(p.dislikes, known),
    preferredPortion: SETS.portions.has(p.preferredPortion) ? p.preferredPortion : 'regular',
  };
  if (preferences.favorites.some((f) => preferences.dislikes.includes(f))) {
    warnings.push('Some foods were in both lists; we kept them as foods you avoid.');
    preferences.favorites = preferences.favorites.filter((f) => !preferences.dislikes.includes(f));
  }
  for (const fav of preferences.favorites) {
    const ing = ingredients[fav];
    if ((ing?.allergens ?? []).some((g) => allergies.confirmed.includes(g)) || allergies.ingredients.includes(fav)) warnings.push(`${ing.name} matches one of your allergies, so meals with it stay hidden.`);
  }
  const appetite = SETS.appetite.has(input.appetite) ? input.appetite : 'good';
  return { value: { allergies, intolerances, preferences, appetite }, errors, warnings, valid: Object.keys(errors).length === 0 };
}

/**
 * The patient-shaped record the engine screens: a regular diet with every portion,
 * and only what the member reported. Ingredients no longer in the catalogue are dropped.
 */
export function screeningProfile(profile, ingredients = {}) {
  const pr = { ...emptyProfile(), ...(profile ?? {}) };
  const has = (id) => Boolean(ingredients[id]);
  const base = emptyPatient();
  return {
    ...base,
    dietOrder: { ...base.dietOrder, categories: ['regular'], npo: false, textureLevel: '', portionsPermitted: ['small', 'regular', 'large'] },
    allergies: { status: pr.allergies.status === 'recorded' ? 'recorded' : 'nka', confirmed: [...pr.allergies.confirmed], ingredients: pr.allergies.ingredients.filter(has), uncoded: [...pr.allergies.uncoded] },
    reportedAllergies: [],
    intolerances: { selected: [...pr.intolerances.selected], ingredients: pr.intolerances.ingredients.filter(has), uncoded: [...pr.intolerances.uncoded] },
    restrictions: { medicalExclusions: [], medicalNotes: '' },
    preferences: { cuisines: [...pr.preferences.cuisines], favorites: pr.preferences.favorites.filter(has), dislikes: pr.preferences.dislikes.filter(has), preferredPortion: pr.preferences.preferredPortion ?? 'regular' },
    appetite: { level: pr.appetite ?? 'good' },
  };
}

/** Diary entries in the shape the engine learns from (mealOutcomes): oldest first. */
export function intakeFromLog(entries) {
  return [...entries]
    .sort((a, b) => a.date.localeCompare(b.date) || PERIOD_IDS.indexOf(a.period) - PERIOD_IDS.indexOf(b.period) || String(a.createdAt).localeCompare(String(b.createdAt)))
    .map((e) => ({ mealId: e.mealId ?? null, mealName: e.name, date: e.date, period: e.period, portion: e.portion, accepted: e.amount !== 'none', amount: e.amount, satisfaction: null, reasons: [...(e.reasons ?? [])] }));
}

// Engine explanations are written for the care team ("the patient"); members read "you".
const WORDING = [
  [/the patient recently reported portions were too large/g, 'you recently said portions were too big'],
  [/the patient recently reported portions were too small/g, 'you recently said portions were too small'],
  [/the patient’s current appetite is poor/g, 'you said your appetite is very small'],
  [/the patient’s appetite is reduced/g, 'you said your appetite is smaller than usual'],
  [/the patient enjoys/g, 'you enjoy'],
  [/which the patient dislikes/g, 'which you avoid'],
  [/the patient dislikes/g, 'you avoid'],
  [/the patient’s disliked ingredients/g, 'the foods you avoid'],
  [/; ask the kitchen to leave it out/g, '; leave it out if you can'],
  [/The patient refused this meal on ([\d-]+) \(did not like it\)/g, 'You left this meal on $1 because you didn’t like it'],
  [/the patient’s|the patient's/g, 'your'],
  [/The patient/g, 'You'],
  [/the patient/g, 'you'],
];
export const forMember = (text) => WORDING.reduce((t, [re, to]) => t.replace(re, to), String(text ?? ''));

function reviewText(r) {
  if (r.ruleId === 'ALG-UNCODED') {
    const what = r.message.match(/“([^”]+)”/)?.[1];
    return what ? `We couldn’t match “${what}” to our ingredient list. Check this meal’s ingredients for it yourself.` : 'Something in your profile couldn’t be matched to our ingredient list. Check the ingredients yourself.';
  }
  if (r.ruleId === 'MENU-INFO-REVIEW') return 'The kitchen changed this meal’s ingredient information recently, and it hasn’t been checked yet.';
  return 'Some information for this meal couldn’t be checked. Read the ingredients before you choose it.';
}

export function createMember(ctx) {
  const { repo, today, stamp, invalid, conflict, requirePermission, catalog, assertDate, assertPeriod, ServiceError } = ctx;

  // ------------------------------------------------------------ ownership
  /** Members only, and only their own documents (keyed by the signed-in account id). */
  function me(actor) {
    requirePermission(actor, 'member:own', 'This is part of the member space for personal accounts.');
    if (!actor.id) throw new ServiceError(401, 'unauthenticated', 'Please log in to continue.');
    return String(actor.id);
  }
  const one = (userId, kind) => repo.listMemberUserDocs(userId, kind)[0] ?? null;
  const profileOf = (userId) => one(userId, 'profile')?.doc ?? null;
  const favoritesOf = (userId) => one(userId, 'favorites')?.doc?.mealIds ?? [];
  const logOf = (userId) => repo.listMemberUserDocs(userId, 'log').map((d) => ({ ...d.doc, id: d.id }));
  function ownLog(userId, id) {
    const d = /^\d{1,9}$/.test(String(id)) ? repo.getMemberUserDoc(id) : null;
    if (!d || d.userId !== userId || d.kind !== 'log') throw new ServiceError(404, 'not_found', 'That diary entry does not exist.');
    return d;
  }
  const saveOne = (userId, kind, doc) => {
    const existing = one(userId, kind);
    return repo.saveMemberUserDoc({ id: existing?.id ?? null, userId, kind, doc, updatedAt: stamp() });
  };
  const ingredients = () => catalog().ingredients;

  // ------------------------------------------------------------ food profile
  const profileView = (p) => {
    const ing = ingredients();
    const name = (id) => ing[id]?.name ?? id;
    return {
      ...p,
      summary: {
        allergies: p.allergies.status === 'nka' ? [] : [...p.allergies.confirmed.map((g) => label(ALLERGENS, g)), ...p.allergies.ingredients.map(name), ...p.allergies.uncoded],
        intolerances: [...p.intolerances.selected.map((i) => label(INTOLERANCES, i)), ...p.intolerances.ingredients.map(name), ...p.intolerances.uncoded],
        likes: p.preferences.favorites.map(name), avoids: p.preferences.dislikes.map(name),
        cuisines: p.preferences.cuisines, portion: label(PORTIONS, p.preferences.preferredPortion), appetite: label(MEMBER_APPETITE, p.appetite),
      },
    };
  };
  function getProfile(actor) {
    const userId = me(actor);
    const p = profileOf(userId);
    return { hasProfile: Boolean(p), profile: profileView(p ?? emptyProfile()), notice: MEMBER_NOTICE };
  }
  function saveProfile(actor, input = {}) {
    const userId = me(actor);
    const r = normalizeProfile(input, ingredients());
    if (!r.valid) invalid(Object.values(r.errors)[0], r.errors);
    saveOne(userId, 'profile', { ...r.value, updatedAt: stamp() });
    return { hasProfile: true, profile: profileView(r.value), warnings: r.warnings, notice: MEMBER_NOTICE };
  }

  // ------------------------------------------------------------ meals for you
  function mealView(m, ev, favorite) {
    const portion = ev.portion;
    const n = portion?.nutrition ?? m.nutrition.perServing;
    const checks = ev.checks.filter((c) => c.status === 'pass' && /^(ALG|INT)-/.test(c.ruleId)).map((c) => c.label.toLowerCase());
    const labelCheck = ev.warnings.find((w) => w.code === 'label-check');
    return {
      id: m.id, name: m.name, category: m.category, cuisine: m.cuisine, description: m.description, art: m.art, type: m.type, servingSize: m.servingSize,
      components: m.components.map((c) => c.name), allergens: m.allergenSummary, status: ev.status, favorite,
      portion: portion ? { suggested: portion.suggested, label: label(PORTIONS, portion.suggested), explanation: forMember(portion.explanation) } : null,
      nutrition: { kcal: n.kcal ?? null, protein: n.protein ?? null, carbs: n.carbs ?? null, fiber: n.fiber ?? null, sodium: n.sodium ?? null },
      why: {
        checked: checks.length ? `Checked against your food profile: ${[...new Set(checks)].join(', ')}.` : 'Checked against your food profile.',
        reasons: ev.reasons.filter((r) => r.text !== portion?.explanation).map((r) => forMember(r.text)),
        review: ev.reviewReasons.map(reviewText),
        notes: labelCheck ? [`Packaged ingredients vary by brand. Check the labels of: ${m.allergenSummary.labelCheck.join(', ')}.`] : [],
      },
    };
  }
  function mealsForYou(actor, { period = null } = {}) {
    const userId = me(actor);
    if (period) assertPeriod(period);
    const profile = profileOf(userId);
    const favorites = favoritesOf(userId);
    const base = { period, periods: PERIODS, favorites, notice: MEMBER_NOTICE };
    if (!profile) return { ...base, hasProfile: false, meals: [], check: [], counts: { fits: 0, check: 0, hidden: 0 } };
    const cat = catalog();
    const mealIds = cat.list.filter((m) => !period || m.category === period).map((m) => m.id);
    const from = addDays(today(), -INTAKE_WINDOW);
    const intake = intakeFromLog(logOf(userId).filter((e) => e.date >= from && e.date <= today()));
    const r = recommend(screeningProfile(profile, cat.ingredients), cat, { mealIds, period: period ?? undefined, intake });
    const fav = (ev) => favorites.includes(ev.mealId);
    const eligible = [...r.eligible.filter(fav), ...r.eligible.filter((e) => !fav(e))];
    return {
      ...base, hasProfile: true,
      meals: eligible.map((ev) => mealView(cat.byId[ev.mealId], ev, fav(ev))),
      check: r.review.map((ev) => mealView(cat.byId[ev.mealId], ev, fav(ev))),
      counts: { fits: r.eligible.length, check: r.review.length, hidden: r.excluded.length },
    };
  }
  function setFavorite(actor, mealId, on = true) {
    const userId = me(actor);
    if (on && !catalog().byId[mealId]) throw new ServiceError(404, 'meal_not_found', 'That meal is not on the CareBite menu.');
    const cur = favoritesOf(userId);
    const next = on ? [...new Set([...cur, String(mealId)])].slice(-200) : cur.filter((x) => x !== String(mealId));
    saveOne(userId, 'favorites', { mealIds: next });
    return { favorites: next, favorite: on };
  }

  // ------------------------------------------------------------ my day (food diary)
  function readEntry(input, previous = null) {
    const errors = {};
    const v = { ...(previous ?? {}), ...input };
    const date = String(v.date ?? '');
    assertDate(date, { from: addDays(today(), -LOG_DAYS_BACK), what: 'This day' });
    if (date > today()) conflict('date_out_of_range', 'You can only add meals for today or earlier days.');
    const period = String(v.period ?? '');
    if (!PERIOD_IDS.includes(period)) errors.period = 'Choose breakfast, lunch, dinner or snack.';
    const amount = String(v.amount ?? '');
    if (!SETS.amounts.has(amount)) errors.amount = 'Choose how much you ate.';
    let reasons = pick(v.reasons, SETS.reasons);
    if (amount === 'all') reasons = reasons.filter((x) => x === 'portion-too-small');
    let entry;
    const mealId = v.mealId ? String(v.mealId) : null;
    if (mealId) {
      const meal = catalog().byId[mealId] ?? null;
      if (!meal && !previous) throw new ServiceError(404, 'meal_not_found', 'That meal is not on the CareBite menu.');
      const portion = SETS.portions.has(v.portion) ? v.portion : 'regular';
      const perServing = meal?.nutrition.perServing.kcal;
      const kcalServed = meal ? (perServing != null ? Math.round(perServing * portionFactor(portion)) : null) : previous?.kcalServed ?? null;
      entry = { mealId, name: meal?.name ?? previous?.name ?? mealId, portion, kcalServed };
    } else {
      const name = clean(v.name, 60);
      if (!name) errors.name = 'Give the food a short name.';
      const raw = 'kcal' in input ? input.kcal : previous?.kcalServed;
      const kcal = raw === '' || raw == null ? NaN : Number(raw);
      if (!Number.isFinite(kcal) || kcal < 0 || kcal > 5000) errors.kcal = 'Enter the calories as a number from 0 to 5,000.';
      entry = { mealId: null, name, portion: null, kcalServed: Number.isFinite(kcal) ? Math.round(kcal) : null };
    }
    if (Object.keys(errors).length) invalid(Object.values(errors)[0], errors);
    return { date, period, amount, reasons, ...entry, createdAt: previous?.createdAt ?? stamp() };
  }
  function entryView(e) {
    const meal = e.mealId ? catalog().byId[e.mealId] : null;
    const share = shareOf(e.amount);
    return {
      id: e.id, date: e.date, period: e.period, periodLabel: label(PERIODS, e.period), mealId: e.mealId, name: e.name,
      meal: meal ? { id: meal.id, name: meal.name, art: meal.art, category: meal.category } : null,
      portion: e.portion, portionLabel: e.portion ? label(PORTIONS, e.portion) : null, amount: e.amount, amountLabel: label(MEMBER_AMOUNTS, e.amount),
      reasons: e.reasons ?? [], reasonLabels: (e.reasons ?? []).map((x) => label(MEMBER_REASONS, x)),
      kcalServed: e.kcalServed, kcalEaten: e.kcalServed == null ? null : Math.round(e.kcalServed * share), leftoverShare: Math.round((1 - share) * 100),
    };
  }
  const byTime = (a, b) => PERIOD_IDS.indexOf(a.period) - PERIOD_IDS.indexOf(b.period) || String(a.createdAt).localeCompare(String(b.createdAt));
  function totals(entries) {
    const known = entries.filter((e) => e.kcalServed != null);
    return {
      entries: entries.length,
      kcalEaten: known.length ? Math.round(known.reduce((s, e) => s + e.kcalServed * shareOf(e.amount), 0)) : null,
      kcalServed: known.length ? Math.round(known.reduce((s, e) => s + e.kcalServed, 0)) : null,
      // Estimated leftovers: share of what was served that was not eaten (from "how much you ate", not weighed).
      leftoverShare: entries.length ? Math.round((1 - entries.reduce((s, e) => s + shareOf(e.amount), 0) / entries.length) * 100) : null,
    };
  }
  function getDay(actor, { date = today() } = {}) {
    const userId = me(actor);
    assertDate(date);
    const entries = logOf(userId).filter((e) => e.date === date).sort(byTime);
    return { date, today: today(), entries: entries.map(entryView), totals: totals(entries) };
  }
  function addLog(actor, input = {}) {
    const userId = me(actor);
    const e = readEntry(input);
    if (logOf(userId).filter((x) => x.date === e.date).length >= MAX_PER_DAY) conflict('too_many', `You can add up to ${MAX_PER_DAY} foods a day.`);
    const saved = repo.saveMemberUserDoc({ userId, kind: 'log', doc: e, updatedAt: stamp() });
    return { entry: entryView({ ...saved.doc, id: saved.id }) };
  }
  function updateLog(actor, id, input = {}) {
    const userId = me(actor);
    const d = ownLog(userId, id);
    const { mealId: _m, ...rest } = input; // the food itself stays; add a new entry for a different food
    const e = readEntry(rest, d.doc);
    const saved = repo.saveMemberUserDoc({ id: d.id, userId, kind: 'log', doc: e, updatedAt: stamp() });
    return { entry: entryView({ ...saved.doc, id: saved.id }) };
  }
  function deleteLog(actor, id) {
    const userId = me(actor);
    const d = ownLog(userId, id);
    repo.deleteMemberUserDoc(d.id);
    return { ok: true };
  }
  /** "Your week": calories eaten and estimated leftovers per day (the intakeTrends loop), plus the top leftover reasons. */
  function getWeek(actor, { date = today() } = {}) {
    const userId = me(actor);
    assertDate(date);
    const from = addDays(date, -6);
    const log = logOf(userId).filter((e) => e.date >= from && e.date <= date);
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(date, -i);
      days.push({ date: d, ...totals(log.filter((e) => e.date === d)) });
    }
    const logged = days.filter((d) => d.entries);
    const withKcal = logged.filter((d) => d.kcalEaten != null);
    const reasons = MEMBER_REASONS.map((r) => ({ id: r.id, label: r.label, count: log.filter((e) => (e.reasons ?? []).includes(r.id)).length })).filter((r) => r.count).sort((a, b) => b.count - a.count).slice(0, 3);
    return {
      from, to: date, days,
      daysLogged: logged.length,
      kcalAverage: withKcal.length ? Math.round(withKcal.reduce((s, d) => s + d.kcalEaten, 0) / withKcal.length) : null,
      leftoverShare: totals(log).leftoverShare,
      reasons,
    };
  }

  /** Everything stored for a member, for "Download my data". */
  function exportMember(userId) {
    return {
      foodProfile: profileOf(userId),
      favouriteMeals: favoritesOf(userId),
      foodDiary: logOf(userId).sort((a, b) => a.date.localeCompare(b.date) || byTime(a, b)).map(({ id: _id, ...e }) => e),
    };
  }

  return {
    exportMember,
    api: { getMemberProfile: getProfile, saveMemberProfile: saveProfile, mealsForYou, setFavorite, getMemberDay: getDay, addMemberLog: addLog, updateMemberLog: updateLog, deleteMemberLog: deleteLog, getMemberWeek: getWeek },
  };
}
