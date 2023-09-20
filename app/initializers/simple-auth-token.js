import TokenAuthenticator from '@triptyk/ember-simple-auth-token/authenticators/token';
import JWTAuthenticator from '@triptyk/ember-simple-auth-token/authenticators/jwt';

/**
  Ember Simple Auth Token's Initializer.
  By default load both the Token and JWT (with refresh) Authenticators.
*/
export default {
  name: 'ember-simple-auth-token',
  before: 'ember-simple-auth',
  initialize(container) {
    container.register('authenticator:token', TokenAuthenticator);
    container.register('authenticator:jwt', JWTAuthenticator);
  }
};
