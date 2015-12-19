import TokenAuthenticator from 'ember-simple-auth-token/authenticators/token';
import JWTAuthenticator from 'ember-simple-auth-token/authenticators/jwt';
import Authorizer from 'ember-simple-auth-token/authorizers/token';
import Configuration from 'ember-simple-auth-token/configuration';
import ENV from '../config/environment';

/**
  Ember Simple Auth Token's Initializer.
  By default load both the Token and JWT (with refresh) Authenticators.
*/
export default {
  name: 'ember-simple-auth-token',
  before: 'ember-simple-auth',
  initialize(container) {
    Configuration.load(container, ENV['ember-simple-auth-token'] || {});
    container.register('authorizer:token', Authorizer);
    container.register('authenticator:token', TokenAuthenticator);
    container.register('authenticator:jwt', JWTAuthenticator);
  }
};
