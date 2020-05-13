import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import ENV from '../config/environment';

export default Route.extend(AuthenticatedRouteMixin, {
  model: function () {
    const adapter = getOwner(this).lookup('adapter:application');

    return adapter.ajax(`${ENV['API_URL'] || ''}/api/users/`, 'GET');
  },

  setupController: function (controller, model) {
    if (!model.username) {
      this.get('session').invalidate();
    }
  }
});
