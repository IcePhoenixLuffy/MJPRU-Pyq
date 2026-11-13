import { test } from 'node:test';
import assert from 'node:assert';
import { OFFICIAL_ADMIN_EMAIL, isAuthorizedAdminUser } from '../lib/supabase';

test('isAuthorizedAdminUser approves users with admin role in app_metadata', () => {
  assert.strictEqual(
    isAuthorizedAdminUser({ app_metadata: { role: 'admin' } }),
    true
  );
});

test('isAuthorizedAdminUser rejects users without admin role in app_metadata', () => {
  assert.strictEqual(isAuthorizedAdminUser({ app_metadata: { role: 'faculty' } }), false);
  assert.strictEqual(isAuthorizedAdminUser({ app_metadata: {} }), false);
  assert.strictEqual(isAuthorizedAdminUser({ user_metadata: { role: 'admin' } } as { app_metadata?: Record<string, any> }), false);
  assert.strictEqual(isAuthorizedAdminUser(null), false);
  assert.strictEqual(isAuthorizedAdminUser(undefined), false);
});

test('OFFICIAL_ADMIN_EMAIL constant defaults to admin@mjpru.ac.in', () => {
  assert.strictEqual(OFFICIAL_ADMIN_EMAIL, 'admin@mjpru.ac.in');
});
