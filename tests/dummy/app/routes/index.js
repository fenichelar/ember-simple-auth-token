import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ENV from '../config/environment';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function () {
    const adapter = Ember.getOwner(this).lookup('adapter:application');

    return adapter.ajax((ENV['API_URL'] || '') + '/api/users/', 'GET');
  },

  setupController: function (controller, model) {
    if (!model.username) {
      this.get('session').invalidate();
    }
  }
});
