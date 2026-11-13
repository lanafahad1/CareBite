// The public hospital menu: by date (the day's cycle menu) and all meals (the whole catalogue).
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryRepo } from '../domain/memory-repo.js';
import { createService } from '../domain/service.js';
import { seedCatalog } from '../domain/demo-data.js';
import { menuFor } from '../domain/menu.js';
import { PERIOD_IDS } from '../domain/constants.js';

let service;
beforeEach(() => {
  const repo = createMemoryRepo();
  seedCatalog(repo, new Date().toISOString());
  service = createService({ repo });
});

const ids = (menu) => menu.periods.flatMap((p) => p.meals.map((m) => m.id));

test('by date (the default) lists that day’s cycle menu by period', () => {
  const date = service.today();
  const m = service.getMenu({ date });
  assert.equal(m.view, 'date');
  assert.ok(m.weekday && m.cycleDay >= 1 && m.cycleDay <= 7);
  assert.deepEqual(m.periods.map((p) => p.id), PERIOD_IDS);
  const planned = menuFor(service.menu(), date);
  for (const p of m.periods) assert.deepEqual(p.meals.map((x) => x.id), planned[p.id]);
});

test('all meals lists every catalogue meal once, under the period it is usually served at', () => {
  const m = service.getMenu({ view: 'all' });
  const all = service.catalog().list;
  assert.equal(m.view, 'all');
  assert.equal(m.total, all.length);
  assert.equal(new Set(ids(m)).size, all.length);
  assert.deepEqual(m.periods.map((p) => p.id), PERIOD_IDS);
  for (const p of m.periods) assert.ok(p.meals.every((x) => x.category === p.id && Array.isArray(x.compatibility)));
  // The whole catalogue is larger than any one day's menu.
  assert.ok(m.total > ids(service.getMenu({})).length);
});

test('all meals keeps the search, diet, type and period filters', () => {
  const lunch = service.getMenu({ view: 'all', period: 'lunch' });
  assert.deepEqual(lunch.periods.map((p) => p.id), ['lunch']);
  const singles = service.getMenu({ view: 'all', type: 'single' });
  assert.ok(singles.total > 0 && singles.periods.every((p) => p.meals.every((x) => x.type === 'single')));
  const renal = service.getMenu({ view: 'all', diet: 'renal' });
  assert.ok(renal.periods.every((p) => p.meals.every((x) => ['eligible', 'depends'].includes(x.compatibility.find((c) => c.id === 'renal')?.status))));
  const kabsa = service.getMenu({ view: 'all', q: 'kabsa' });
  assert.ok(kabsa.total > 0 && kabsa.total < service.catalog().list.length);
  assert.equal(service.getMenu({ view: 'all', q: 'zzz-no-such-meal' }).total, 0);
});
