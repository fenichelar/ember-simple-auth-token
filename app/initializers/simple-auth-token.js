import TokenAuthenticator from 'simple-auth-token/authenticators/token';
import JWTAuthenticator from 'simple-auth-token/authenticators/jwt';
import JWTResolvedAuthenticator from 'simple-auth-token/authenticators/jwt-resolved';
import Authorizer from 'simple-auth-token/authorizers/token';
import Configuration from 'simple-auth-token/configuration';
import getGlobalConfig from 'simple-auth-token/utils/get-global-config';

/**
  Ember Simple Auth Token's Initializer.
  By default load both the Token and JWT (with refresh) Authenticators.
*/
export default {
  name: 'simple-auth-token',
  before: 'simple-auth',
  initialize: function(container) {
    Configuration.load(container, getGlobalConfig('simple-auth-token'));
    container.register('simple-auth-authorizer:token', Authorizer);
    container.register('simple-auth-authenticator:token', TokenAuthenticator);
    container.register('simple-auth-authenticator:jwt', JWTAuthenticator);
    container.register('simple-auth-authenticator:jwt-resolved', JWTResolvedAuthenticator);
  }
};
