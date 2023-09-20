import Route from '@ember/routing/route';
import { inject } from '@ember/service';
import { getOwner } from '@ember/application';
import ENV from '../config/environment';

export default class IndexRoute extends Route {
  @inject session;

  model() {
    const adapter = getOwner(this).lookup('adapter:application');
    return adapter.ajax(`${ENV['API_URL'] || ''}/api/users/`, 'GET');
  }

  setupController(_, model) {
    if (!model.username) {
      this.get('session').invalidate();
    }
  }
}
