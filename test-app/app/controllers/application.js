import Controller from '@ember/controller';
import { service } from '@ember/service';
import config from '../config/environment';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  @service session;

  @action
  invalidateSession() {
    this.session.invalidate();
  }

  get config() {
    return JSON.stringify(config['ember-simple-auth-token'], null, '\t');
  }

  get sessionData() {
    return JSON.stringify(
      this.session.session.content.authenticated,
      null,
      '\t',
    );
  }
}
