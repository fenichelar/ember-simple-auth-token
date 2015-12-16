import Ember from 'ember';

export default Ember.Controller.extend({
  identification: 'admin',
  password: 'abc123',

  session: Ember.inject.service('session'),

  actions: {
    authenticate: function() {
      var credentials = this.getProperties('identification', 'password'),
          authenticator = 'authenticator:jwt';

      this.get('session').authenticate(authenticator, credentials);
    }
  }
});
