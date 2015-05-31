import Ember from 'ember';

export default Ember.Controller.extend({
  sessionData: Ember.computed('session.secure', function() {
    return JSON.stringify(this.get('session.secure'), null, '\t');
  }),
  tokenData: Ember.computed('session.secure', function() {
    var authenticator = this.container.lookup('simple-auth-authenticator:jwt'),
        session = this.get('session.secure'),
        tokenData = {};

    if(Ember.keys(session).length > 0) {
      tokenData = authenticator.getTokenData(session.token);
    }

    return JSON.stringify(tokenData, null, '\t');
  })
});
