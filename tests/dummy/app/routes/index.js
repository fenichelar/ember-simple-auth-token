import Ember from 'ember';
import AuthenticatedRouteMixin from 'simple-auth/mixins/authenticated-route-mixin';
import ENV from '../config/environment';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  model: function() {
    return Ember.$.getJSON(ENV['API_URL'] || '' + '/api/users/');
  }
});
