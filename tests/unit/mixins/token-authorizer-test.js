import EmberObject from '@ember/object';
import TokenAuthorizerMixin from 'ember-simple-auth-token/mixins/token-authorizer';
import { module, test } from 'qunit';

module('Unit | Mixin | token-authorizer', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let TokenAuthorizerObject = EmberObject.extend(TokenAuthorizerMixin);
    let subject = TokenAuthorizerObject.create();
    assert.ok(subject);
  });
});
