import EmberRouter from '@ember/routing/router';
import config from 'test-app/config/environment';

class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
});

export default Router;
