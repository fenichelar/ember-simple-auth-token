import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { service } from '@ember/service';
import ENV from 'test-app/config/environment';

export default class ApplicationAdapter extends JSONAPIAdapter {
  namespace = 'api';
  host = ENV.api;

  @service session;

  get headers() {
    if (this.session.isAuthenticated) {
      return {
        Authorization: `Bearer ${this.session.data.authenticated.token}`,
      };
    } else {
      return {};
    }
  }
}