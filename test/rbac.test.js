import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PERMISSIONS, ROLE_IDS, HOSPITAL_ROLE_IDS, can, permissionsFor, SECTION_PERMISSION } from '../domain/rbac.js';

const HOSPITAL_PERMISSIONS = Object.keys(PERMISSIONS).filter((p) => !p.startsWith('member:'));

test('the hospital has three roles only; members are a separate personal role', () => {
  assert.deepEqual(HOSPITAL_ROLE_IDS, ['admin', 'staff', 'patient']);
  assert.deepEqual(ROLE_IDS, ['admin', 'staff', 'patient', 'member']);
  for (const roles of Object.values(PERMISSIONS)) for (const r of roles) assert.ok(ROLE_IDS.includes(r));
  for (const p of HOSPITAL_PERMISSIONS) for (const r of PERMISSIONS[p]) assert.ok(HOSPITAL_ROLE_IDS.includes(r), `${p} is hospital-only`);
});

test('admin holds every hospital permission (controls the hospital), but not the member space', () => {
  assert.deepEqual(permissionsFor('admin').sort(), HOSPITAL_PERMISSIONS.sort());
  assert.ok(!can('admin', 'member:own'));
});

test('members hold only their own member space; no hospital role reaches it', () => {
  assert.deepEqual(permissionsFor('member'), ['member:own']);
  for (const r of HOSPITAL_ROLE_IDS) assert.ok(!can(r, 'member:own'), r);
});

test('staff run meal service but cannot make clinical decisions or manage access', () => {
  for (const p of ['patient:list', 'meal:offer', 'meal:confirm', 'kitchen:progress', 'menu:edit', 'intake:record', 'request:resolve', 'patient:admission']) assert.ok(can('staff', p), p);
  for (const p of ['patient:edit-clinical', 'meal:approve-review', 'menu:verify', 'staff:manage', 'patient:delete', 'patient:create', 'request:resolve-clinical', 'demo:reset']) assert.ok(!can('staff', p), p);
});

test('patients reach only patient-facing permissions', () => {
  assert.deepEqual(permissionsFor('patient').sort(), ['intake:record', 'meal:choose', 'patient:edit-appetite', 'patient:edit-preferences', 'patient:read', 'request:create'].sort());
  assert.ok(!can('patient', SECTION_PERMISSION.clinical));
});

test('no role, unknown roles and unknown permissions are denied', () => {
  assert.equal(can(null, 'patient:read'), false);
  assert.equal(can('dietitian', 'patient:list'), false);
  assert.throws(() => can('admin', 'nope:nothing'), /Unknown permission/);
});
