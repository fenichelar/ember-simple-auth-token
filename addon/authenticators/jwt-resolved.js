import Ember from 'ember';
import JwtTokenAuthenticator from './jwt';

/**
  Special type of JWT token that takes a token instead of credentials

  The factory for this authenticator is registered as
  'simple-auth-authenticator:jwt-resolved` in Ember's container.

  @class JWTResolved
  @namespace SimpleAuth.Authenticators
  @module simple-auth-token/authenticators/jwt-resolved
  @extends TokenAuthenticator
*/
export default JwtTokenAuthenticator.extend({

  /**
    Authenticates the session with the specified `token`.

    It will always return a resolved promise.

    An automatic token refresh will be scheduled with the new expiration date
    from the returned refresh token. That expiration will be merged with the
    response and the promise resolved.

    @method authenticate
    @param {Object} options The token to use
    @return {Ember.RSVP.Promise} A promise that always resolves
  */
  authenticate: function(token) {
    return new Ember.RSVP.Promise(resolve => {
      let tokenData = this.getTokenData(token);
      let expiresAt = tokenData[this.tokenExpireName];
      let response  = {};
      response[this.tokenPropertyName] = token;
      response.expiresAt = expiresAt;
      this.scheduleAccessTokenRefresh(expiresAt, token);

      resolve(this.getResponseData(response));
    });
  },
});
