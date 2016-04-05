import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import ApplicationIdleRouteMixin from 'ember-simple-auth-token/mixins/application-idle-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin, ApplicationIdleRouteMixin, {
  session: Ember.inject.service('session'),
  messages: Ember.inject.service('flashMessages'),

  invalidateIdledSession() {
    this.get('messages').danger(
      'Your token has been invalidated because you where idle!',
      {sticky: true}
    );
    this.get('session').invalidate();
  },

  sessionInvalidated() {
    this.transitionTo('login');
  },

  actions: {
    invalidateSession: function() {
      this.get('session').invalidate();
    }
  }
});
