import { module, test } from 'qunit';
import { click, fillIn, visit, currentURL, settled, waitFor } from '@ember/test-helpers';
import { setupApplicationTest } from 'test-app/tests/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | login', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('successful login/logout', async function (assert) {
    assert.expect(3);
    await visit('/login');

    assert.strictEqual(currentURL(), '/login');

    await fillIn('#username', 'admin');
    await fillIn('#password', 'abc123');

    await click('#btn-login');

    await waitFor('#h1-home', { timeout: 2000 })

    assert.dom('#h1-home').hasText('Home Page');

    await click('#btn-logout');

    await waitFor('#h1-login', { timeout: 2000 })

    assert.strictEqual(currentURL(), '/login');
  });

  test('unsuccessful login', async function (assert) {
    assert.expect(2);
    await visit('/login');

    assert.strictEqual(currentURL(), '/login');

    await fillIn('#username', 'admin');
    await fillIn('#password', 'invalid');

    await click('#btn-login');

    await settled();

    assert.dom('#error-message').hasText('Incorrect username or password');
  });

  test('redirect to login', async function (assert) {
    assert.expect(1);
    await visit('/secure');

    await settled();

    assert.strictEqual(currentURL(), '/login');
  });
});
