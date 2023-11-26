import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class LoginController extends Controller {
  @service session;
  username = 'admin';
  password = 'abc123';

  @action
  authenticate() {
    const credentials = this.getProperties('username', 'password');
    const authenticator = 'authenticator:jwt';

    this.get('session').authenticate(authenticator, credentials);
  }
}
