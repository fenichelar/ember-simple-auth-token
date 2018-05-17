import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Route.extend(ApplicationRouteMixin, {
  session: inject('session'),

  actions: {
    invalidateSession: function() {
      this.get('session').invalidate();
    }
  }
});
