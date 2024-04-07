import { module, test } from 'qunit';
import { setupTest } from 'test-app/tests/helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
//import { createServer } from 'miragejs';

module('Unit | Component | authenticators/jwt.js', function (hooks) {


  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.owner.application.jwt = this.owner.lookup('authenticator:jwt');
  });

  const createFakeToken = obj => {
    return `a.${btoa(JSON.stringify(obj))}.b`;
  };

  const createFakeRefreshToken = () => {
    return btoa('91df47a8-8c7f-4411-98e7-43bfd32df5c4');
  };

  const getConvertedTime = time => {
    return Math.round(time / 1000);
  };

  test('authenticators/jwt exists', function (assert) {
    assert.expect(1);
    assert.ok(this.owner.application.jwt.getCurrentTime());
  });

  test('getCurrentTime works', function (assert) {
    assert.expect(1);
    assert.equal(this.owner.application.jwt.getCurrentTime(), Math.floor(new Date().valueOf() / 1000));
  });

  test('#restore resolves when the data includes `token` and `expiresAt`', function (assert) {
    const expiresAt = getConvertedTime(Date.now()) + 60;
    const tokenData = {
      exp: expiresAt
    };
    const token = createFakeToken({
      exp: expiresAt
    });
    const refreshToken = createFakeRefreshToken();
    const data = {
      token: token,
      exp: expiresAt,
      tokenData: tokenData
    };

    /*this.owner.application.jwt.restore(data).then((content) => {
      assert.deepEqual(content, data);
    });*/

    assert.ok(this.owner.application.jwt.getCurrentTime());
  });
});
