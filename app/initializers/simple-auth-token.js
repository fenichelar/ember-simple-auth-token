import Configuration from 'simple-auth-token/configuration';
import TokenAuthenticator from 'simple-auth-token/authenticators/token';
import JWTAuthenticator from 'simple-auth-token/authenticators/jwt';
import Authorizer from 'simple-auth-token/authorizers/token';
import ENV from '../config/environment';

/**
  Ember Simple Auth Token's Initializer.
  By default load both the Token and JWT (with refresh) Authenticators.
*/
export default {
  name: 'simple-auth-token',
  before: 'simple-auth',
  initialize: function(container) {
    Configuration.load(container, ENV['simple-auth-token'] || {});
    container.register('simple-auth-authorizer:token', Authorizer);
    container.register('simple-auth-authenticator:token', TokenAuthenticator);
    container.register('simple-auth-authenticator:jwt', JWTAuthenticator);
  }
};
