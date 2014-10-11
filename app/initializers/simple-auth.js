import Configuration from 'simple-auth/configuration';
import setup from 'simple-auth/setup';
import ENV from '../config/environment';

export default {
  name:       'simple-auth',
  initialize: function(container, application) {
    Configuration.load(container, ENV['simple-auth'] || {});
    setup(container, application);
  }
};
