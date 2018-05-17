import Controller from '@ember/controller';
import { inject } from '@ember/service';

export default Controller.extend({
  session: inject('session'),
  username: 'admin',
  password: 'abc123',

  actions: {
    authenticate: function() {
      var credentials = this.getProperties('username', 'password'),
          authenticator = 'authenticator:jwt';

      this.get('session').authenticate(authenticator, credentials);
    }
  }
});
