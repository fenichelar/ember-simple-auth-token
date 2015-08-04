import Configuration from 'simple-auth-token/configuration';
import ENV from '../config/environment';

/**
  Ember Simple Auth Token's Initializer.
  By default load both the Token and JWT (with refresh) Authenticators.
*/
export default {
  name: 'simple-auth-token',
  before: 'simple-auth',
  initialize: function(instance) {
    Configuration.load(instance.container, ENV['simple-auth-token'] || {});
  }
};
