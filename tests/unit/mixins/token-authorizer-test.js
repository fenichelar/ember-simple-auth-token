import EmberObject from '@ember/object';
import TokenAuthorizerMixin from 'ember-simple-auth-token/mixins/token-authorizer';
import { module, test } from 'qunit';

module('Unit | Mixin | token-authorizer', function() {
  test('it works', function (assert) {
    const TokenAuthorizerObject = EmberObject.extend(TokenAuthorizerMixin);
    const subject = TokenAuthorizerObject.create();
    assert.ok(subject);
  });
});
