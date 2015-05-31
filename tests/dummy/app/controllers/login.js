import Ember from 'ember';

export default Ember.Controller.extend({
  identification: 'admin',
  password: 'abc123',

  actions: {
    authenticate: function() {
      var credentials = this.getProperties('identification', 'password'),
          authenticator = 'simple-auth-authenticator:jwt';

      this.get('session').authenticate(authenticator, credentials);
    }
  }
});
