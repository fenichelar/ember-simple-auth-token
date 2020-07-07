import EmberObject from '@ember/object';
import TokenAdapterMixin from 'ember-simple-auth-token/mixins/token-adapter';
import { module, test } from 'qunit';

module('Unit | Mixin | token-adapter', function() {
  test('it works', function (assert) {
    const TokenAdapterObject = EmberObject.extend(TokenAdapterMixin);
    const subject = TokenAdapterObject.create();
    assert.ok(subject);
  });
});
