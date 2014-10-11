import Configuration from 'simple-auth-token/configuration';
import Authenticator from 'simple-auth-token/authenticators/token';
import Authorizer from 'simple-auth-token/authorizers/token';
import ENV from '../config/environment';

export default {
  name: 'simple-auth-token',
  before: 'simple-auth',
  initialize: function(container){
    Configuration.load(container, ENV['simple-auth-token'] || {});
    container.register('simple-auth-authorizer:token', Authorizer);
    container.register('simple-auth-authenticator:token', Authenticator);
  }
};
