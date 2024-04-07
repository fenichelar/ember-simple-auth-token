import { module, test } from 'qunit';
import { setupTest } from 'test-app/tests/helpers';

module('Unit | Component | authenticators/token.js', function (hooks) {
  setupTest(hooks);

  test('token exists', function (assert) {
    /*let component = this.owner
      .factoryFor('authenticator:authenticators/token.js')
      .create();*/
    const token = this.owner.lookup('authenticator:token');
    assert.ok(token);
  });
});
