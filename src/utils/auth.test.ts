import { test } from 'node:test';
import assert from 'node:assert';
import { OFFICIAL_ADMIN_EMAIL, isAuthorizedAdminUser } from '../lib/supabase';

test('isAuthorizedAdminUser approves official admin email', () => {
  assert.strictEqual(isAuthorizedAdminUser({ email: 'admin@mjpru.ac.in' }), true);
  assert.strictEqual(isAuthorizedAdminUser({ email: 'ADMIN@MJPRU.AC.IN' }), true);
  assert.strictEqual(isAuthorizedAdminUser({ email: '  admin@mjpru.ac.in  ' }), true);
});

test('isAuthorizedAdminUser approves users with admin role in metadata', () => {
  assert.strictEqual(
    isAuthorizedAdminUser({ email: 'staff@mjpru.ac.in', app_metadata: { role: 'admin' } }),
    true
  );
  assert.strictEqual(
    isAuthorizedAdminUser({ email: 'staff@mjpru.ac.in', user_metadata: { role: 'admin' } }),
    true
  );
});

test('isAuthorizedAdminUser rejects ordinary users without admin email or role', () => {
  assert.strictEqual(isAuthorizedAdminUser({ email: 'student@mjpru.ac.in' }), false);
  assert.strictEqual(isAuthorizedAdminUser({ email: 'john.doe@gmail.com' }), false);
  assert.strictEqual(isAuthorizedAdminUser({ email: 'faculty@mjpru.ac.in', app_metadata: { role: 'faculty' } }), false);
  assert.strictEqual(isAuthorizedAdminUser(null), false);
  assert.strictEqual(isAuthorizedAdminUser(undefined), false);
  assert.strictEqual(isAuthorizedAdminUser({ email: '' }), false);
});

test('OFFICIAL_ADMIN_EMAIL constant is strictly admin@mjpru.ac.in', () => {
  assert.strictEqual(OFFICIAL_ADMIN_EMAIL, 'admin@mjpru.ac.in');
});
