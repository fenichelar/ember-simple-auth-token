import TokenAuthenticator from 'simple-auth-token/authenticators/token';
import JWTAuthenticator from 'simple-auth-token/authenticators/jwt';
import Authorizer from 'simple-auth-token/authorizers/token';

/**
  Ember Simple Auth Token's Initializer.
  By default load both the Token and JWT (with refresh) Authenticators.
*/
export default {
  name: 'simple-auth-token',
  before: 'simple-auth',
  initialize: function(registry, application) {
    application.register('simple-auth-authorizer:token', Authorizer);
    application.register('simple-auth-authenticator:token', TokenAuthenticator);
    application.register('simple-auth-authenticator:jwt', JWTAuthenticator);
  }
};
