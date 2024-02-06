import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default class ApplicationRoute extends Route {
  @inject session;
  @inject fastboot;

  async beforeModel() {
    await this.session.setup();
  }
}
