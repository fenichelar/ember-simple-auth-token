import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default class LoginRoute extends Route {
  @inject session;

  beforeModel() {
    this.session.prohibitAuthentication('authenticated.index');
  }
}
