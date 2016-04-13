import Ember from 'ember';
import getOwner from 'ember-getowner-polyfill';

export default Ember.Mixin.create({
  init() {
    const authenticator = getOwner(this).lookup('authenticator:jwt');

    authenticator.on(
      'invalidateIdledSession',
      Ember.run.bind(this, () => {
       this.invalidateIdledSession(...arguments);
      })
    );
  }
});
