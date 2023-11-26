import Controller from '@ember/controller';
import { service } from '@ember/service';
import { get } from '@ember/object';
import config from '../config/environment';

export default class ApplicationController extends Controller {
  @service session;

  get config() {
    return JSON.stringify(get(config, 'ember-simple-auth-token'), null, '\t');
  }

  get sessionData() {
    return JSON.stringify(this.get('session.session.content.authenticated'), null, '\t');
  }
}
