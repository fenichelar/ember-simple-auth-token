import EmberObject, { get } from '@ember/object';
import { assign } from '@ember/polyfills';
import { Promise, resolve } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { cancel, later } from '@ember/runloop';
import TokenAuthenticator from './token';
import config from 'ember-get-config';

/**
  JWT (JSON Web Token) Authenticator that supports automatic token refresh.

  Inspired by [ember-simple-auth-oauth2](https://github.com/simplabs/ember-simple-auth/tree/master/packages/ember-simple-auth-oauth2)

  The factory for this authenticator is registered as
  'authenticator:jwt` in Ember's container.

  @class JWT
  @namespace SimpleAuth.Authenticators
  @module ember-simple-auth-token/authenticators/jwt
  @extends TokenAuthenticator
*/
export default TokenAuthenticator.extend({
  /**
    @method init
    @private
  */
  init() {
    this._super(...arguments);
    const conf = config['ember-simple-auth-token'] || {};
    this.tokenDataPropertyName = conf.tokenDataPropertyName || 'tokenData';
    this.refreshAccessTokens = conf.refreshAccessTokens === false ? false : true;
    this.tokenExpirationInvalidateSession = conf.tokenExpirationInvalidateSession === false ? false : true;
    this.serverTokenRefreshEndpoint = conf.serverTokenRefreshEndpoint || '/api/token-refresh/';
    this.refreshTokenPropertyName = conf.refreshTokenPropertyName || 'refresh_token';
    this.tokenExpireName = conf.tokenExpireName || 'exp';
    this.refreshLeeway = conf.refreshLeeway || 0;
  },

  /**
    Restores the session from a set of session properties.

    It will return a resolving promise if one of two conditions is met:

    1) Both `data.token` and `data.expiresAt` are non-empty and `expiresAt`
       is greater than the calculated `now`.
    2) If `data.token` is non-empty and the decoded token has a key for
       `tokenExpireName`.

    If `refreshAccessTokens` is true, `scheduleAccessTokenRefresh` will
    be called and an automatic token refresh will be initiated.

    @method restore
    @param {Object} data The data to restore the session from
    @return {Promise} A promise that when it resolves results
                                 in the session being authenticated
  */
  restore(data) {
    const dataObject = EmberObject.create(data);

    return new Promise((resolve, reject) => {
      const now = this.getCurrentTime();
      const token = dataObject.get(this.tokenPropertyName);
      const refreshToken = dataObject.get(this.refreshTokenPropertyName);
      let expiresAt = dataObject.get(this.tokenExpireName);

      if (isEmpty(token)) {
        return reject(new Error('empty token'));
      }

      if (isEmpty(expiresAt)) {
        // Fetch the expire time from the token data since `expiresAt`
        // wasn't included in the data object that was passed in.
        const tokenData = this.getTokenData(token);
        expiresAt = tokenData[this.tokenExpireName];
        if (isEmpty(expiresAt)) {
          return resolve(data);
        }
      }

      if (expiresAt > now) {
        const wait = (expiresAt - now - this.refreshLeeway) * 1000;

        if (this.tokenExpirationInvalidateSession) {
          this.scheduleAccessTokenExpiration(expiresAt);
        }

        if (wait > 0) {
          if (this.refreshAccessTokens) {
            this.scheduleAccessTokenRefresh(dataObject.get(this.tokenExpireName), refreshToken);
          }
          return resolve(data);
        } else if (this.refreshAccessTokens) {
          return resolve(this.refreshAccessToken(refreshToken));
        } else {
          return reject(new Error('unable to refresh token'));
        }
      } else {
        // the refresh token might not be expired,
        // we can't test this on the client so attempt to refresh the token.
        // If the server rejects the token the user session will be invalidated
        if (this.refreshAccessTokens) {
          return resolve(this.refreshAccessToken(refreshToken));
        } else {
          return reject(new Error('token is expired'));
        }
      }
    });
  },

  /**
    Authenticates the session with the specified `credentials`.

    It will return a resolving promise if it successfully posts a request
    to the `JWT.serverTokenEndpoint` with the valid credentials.

    An automatic token refresh will be scheduled with the new expiration date
    from the returned refresh token. That expiration will be merged with the
    response and the promise resolved.

    @method authenticate
    @param {Object} credentials The credentials to authenticate the session with
    @param {Object} headers Optional headers to send with the authentication request
    @return {Promise} A promise that resolves when an auth token is
                                 successfully acquired from the server and rejects
                                 otherwise
  */
  authenticate(credentials, headers) {
    return this.makeRequest(this.serverTokenEndpoint, credentials, assign({}, this.headers, headers))
      .then(response => this.handleAuthResponse(response.json));
  },

  /**
    Schedules a token refresh request to be sent to the backend after a calculated
    `wait` time has passed.

    If both `token` and `expiresAt` are non-empty, and `expiresAt` minus the optional
    refres leeway is greater than the calculated `now`, the token refresh will be scheduled
    through later.

    @method scheduleAccessTokenRefresh
    @private
  */
  scheduleAccessTokenRefresh(expiresAt, refreshToken) {
    if (this.refreshAccessTokens) {

      const now = this.getCurrentTime();
      const wait = (expiresAt - now - this.refreshLeeway) * 1000;

      if (!isEmpty(refreshToken) && !isEmpty(expiresAt)) {
        if (wait > 0) {
          cancel(this._refreshTokenTimeout);
          delete this._refreshTokenTimeout;
          this._refreshTokenTimeout = later(this, this.refreshAccessToken, refreshToken, wait);
        } else if (expiresAt > now) {
          throw new Error('refreshLeeway is too large which is preventing token refresh');
        }
      }
    }
  },

  /**
    Makes a refresh token request to grab a new authenticated JWT token from the server.

    It will return a resolving promise if a successful POST is made to the
    `JWT.serverTokenRefreshEndpoint`.

    After the new token is obtained it will schedule the next automatic token refresh
    based on the new `expiresAt` time.

    The session will be updated via the trigger `sessionDataUpdated`.

    @method refreshAccessToken
    @private
  */
  refreshAccessToken(token) {
    const data = this.makeRefreshData(token);

    return this.makeRequest(this.serverTokenRefreshEndpoint, data, this.headers)
      .then(response => {
        const sessionData = this.handleAuthResponse(response.json);
        this.trigger('sessionDataUpdated', sessionData);
        return sessionData;
      })
      .catch(error => {
        this.handleTokenRefreshFail(error.status);
        return Promise.reject(error);
      });
  },

  /**
    Returns a nested object with the token property name.
    Example:  If `refreshTokenPropertyName` is "data.user.refreshToken", `makeRefreshData` will return {data: {user: {refreshToken: "token goes here"}}}

    @method makeRefreshData
    @return {object} An object with the nested property name.
  */
  makeRefreshData(refreshToken) {
    const data = {};
    const nestings = this.refreshTokenPropertyName.split('.');
    const refreshTokenPropertyName = nestings.pop();
    let lastObject = data;

    nestings.forEach(nesting => {
      lastObject[nesting] = {};
      lastObject = lastObject[nesting];
    });

    lastObject[refreshTokenPropertyName] = refreshToken;

    return data;
  },

  /**
    Returns the decoded token with accessible returned values.

    @method getTokenData
    @return {object} An object with properties for the session.
  */
  getTokenData(token) {
    const payload = token.split('.')[1];
    const tokenData = decodeURIComponent(window.escape(atob(payload.replace (/-/g, '+').replace(/_/g, '/'))));

    try {
      return JSON.parse(tokenData);
    } catch (error) {
      return tokenData;
    }
  },

  /**
    Cancels any outstanding automatic token refreshes and returns a resolving
    promise.
    @method invalidate
    @param {Object} data The data of the session to be invalidated
    @return {Promise} A resolving promise
  */
  invalidate() {
    cancel(this._refreshTokenTimeout);
    delete this._refreshTokenTimeout;
    cancel(this._tokenExpirationTimeout);
    delete this._tokenExpirationTimeout;
    return resolve();
  },

  /**
    Returns the current time as a timestamp in seconds
    @method getCurrentTime
    @return {Integer} timestamp
  */
  getCurrentTime() {
    return Math.floor((new Date()).getTime() / 1000);
  },

  /**
    Handles authentication response from server, and returns session data

    @method handleAuthResponse
    @private
   */
  handleAuthResponse(response) {
    const token = get(response, this.tokenPropertyName);

    if (isEmpty(token)) {
      throw new Error('Token is empty. Please check your backend response.');
    }

    const tokenData = this.getTokenData(token);
    const expiresAt = get(tokenData, this.tokenExpireName);
    const tokenExpireData = {};

    tokenExpireData[this.tokenExpireName] = expiresAt;

    if (this.tokenExpirationInvalidateSession) {
      this.scheduleAccessTokenExpiration(expiresAt);
    }

    if (this.refreshAccessTokens) {
      const refreshToken = get(response, this.refreshTokenPropertyName);

      if (isEmpty(refreshToken)) {
        throw new Error('Refresh token is empty. Please check your backend response.');
      }

      this.scheduleAccessTokenRefresh(expiresAt, refreshToken);
    }

    return assign(response, tokenExpireData, {tokenData: tokenData});
  },

  /**
    Handles token refresh fail status. If the server response to a token refresh has a
    status of 401 or 403 then the token in the session will be invalidated and
    the sessionInvalidated provided by ember-simple-auth will be triggered.

    @method handleTokenRefreshFail
  */

  handleTokenRefreshFail(refreshStatus) {
    if (refreshStatus === 401 || refreshStatus === 403) {
      return this.invalidate().then(() => {
        this.trigger('sessionDataInvalidated');
      });
    }
  },

  /**
    Schedules session invalidation at the time token expires.

    @method scheduleAccessTokenExpiration
    @private
  */
  scheduleAccessTokenExpiration(expiresAt) {
    const now = this.getCurrentTime();
    const wait = Math.max((expiresAt - now) * 1000, 0);

    if (!isEmpty(expiresAt)) {
      cancel(this._tokenExpirationTimeout);
      delete this._tokenExpirationTimeout;
      this._tokenExpirationTimeout = later(this, this.handleAccessTokenExpiration, wait);
    }
  },

  /**
    Handles access token expiration

    @method handleAccessTokenExpiration
    @private
  */
  handleAccessTokenExpiration() {
    return this.invalidate().then(() => {
      this.trigger('sessionDataInvalidated');
    });
  }
});
