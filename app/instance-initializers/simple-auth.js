import Configuration from 'simple-auth/configuration';
import setup from 'simple-auth/setup';
import ENV from '../config/environment';

export default {
  name: 'simple-auth',
  initialize: function(instance) {
    Configuration.load(instance.container, ENV['simple-auth'] || {});
  }
};
