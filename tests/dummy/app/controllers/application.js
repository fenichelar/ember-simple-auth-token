import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  sessionData: Ember.computed('session.session.content.authenticated', function() {
    return JSON.stringify(this.get('session.session.content.authenticated'), null, '\t');
  }),

  tokenData: Ember.computed('session.session.content.authenticated', function() {
    var authenticator = this.container.lookup('authenticator:jwt'),
        session = this.get('session.session.content.authenticated'),
        tokenData = {};

    if(session && Object.keys(session).length > 0) {
      tokenData = authenticator.getTokenData(session.token);
    }

    return JSON.stringify(tokenData, null, '\t');
  })
});
