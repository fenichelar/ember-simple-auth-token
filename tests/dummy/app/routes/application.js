import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default class ApplicationRoute extends Route {
  @inject session;

  @action
  invalidateSession() {
    this.session.invalidate();
  }
}
