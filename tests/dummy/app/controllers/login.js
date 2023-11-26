import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class LoginController extends Controller {
  @service session;
  username = 'admin';
  password = 'abc123';

  @action
  authenticate() {
    const credentials = { username: this.username, password: this.password };
    const authenticator = 'authenticator:jwt';

    this.session.authenticate(authenticator, credentials);
  }
}
