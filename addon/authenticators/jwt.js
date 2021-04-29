/* global FastBoot */

import EmberObject, { get } from '@ember/object';
import { getOwner } from '@ember/application';
import { assign } from '@ember/polyfills';
import { Promise, resolve } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { cancel, later } from '@ember/runloop';
import TokenAuthenticator from './token';

const decode = str => {
  if (typeof atob === 'function') {
    return atob(str);
  } else if (typeof FastBoot === 'object') {
    try {
      const buffer = FastBoot.require('buffer');
      return buffer.Buffer.from(str, 'base64').toString('utf-8');
    } catch (err) {
      throw new Error('buffer must be available for decoding base64 strings in FastBoot. Make sure to add buffer to your fastbootDependencies.');
    }
  } else {
    throw new Error('Neither atob nor the FastBoot global are avaialble. Unable to decode base64 strings.');
  }
};

/**
  JWT (JSON Web Token) Authenticator that supports automatic token refresh.

  Inspired by [ember-simple-auth-oauth2](https://github.com/simplabs/ember-simple-auth/tree/master/packages/ember-simple-auth-oauth2)

  The factory for this authenticator is registered as 'authenticator:jwt` in Ember's container.

  @class JWT
  @namespace SimpleAuth.Authenticators
  @module ember-simple-auth-token/authenticators/jwt
  @extends TokenAuthenticator
*/
export default TokenAuthenticator.extend({
  /**
    @method init
  */
  init() {
    this._super(...arguments);
    const owner = getOwner(this);
    const environment = owner ? owner.resolveRegistration('config:environment') || {} : {};
    const config = environment['ember-simple-auth-token'] || {};
    this.tokenDataPropertyName = config.tokenDataPropertyName || 'tokenData';
    this.refreshAccessTokens = config.refreshAccessTokens === false ? false : true;
    this.tokenExpirationInvalidateSession = config.tokenExpirationInvalidateSession === false ? false : true;
    this.serverTokenRefreshEndpoint = config.serverTokenRefreshEndpoint || '/api/token-refresh/';
    this.refreshTokenPropertyName = config.refreshTokenPropertyName || 'refresh_token';
    this.tokenExpireName = config.tokenExpireName || 'exp';
    this.refreshLeeway = config.refreshLeeway || 0;
    this.tokenRefreshInvalidateSessionResponseCodes = config.tokenRefreshInvalidateSessionResponseCodes || [401, 403];
    this.refreshAccessTokenRetryAttempts = config.refreshAccessTokenRetryAttempts || 0;
    this.refreshAccessTokenRetryTimeout = config.refreshAccessTokenRetryTimeout || 1000;
    this.tokenRefreshFailInvalidateSession = config.tokenRefreshFailInvalidateSession === true ? true : false;
  },

  /**
    Restores the session from a set of session properties.

    It will return a resolving promise if one of two conditions is met:

    1) Both `data.token` and `data.expiresAt` are non-empty and `expiresAt` is greater than the calculated `now`.
    2) If `data.token` is non-empty and the decoded token has a key for `tokenExpireName`.

    If `refreshAccessTokens` is true, `scheduleAccessTokenRefresh` will be called and an automatic token refresh will be initiated.

    @method restore
    @param {Object} data Data to restore the session from
    @return {Promise} Promise that when it resolves results in the session being authenticated
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
        // Fetch the expire time from the token data since `expiresAt` wasn't included in the data object that was passed in.
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
            this.scheduleAccessTokenRefresh(expiresAt, refreshToken);
          }
          return resolve(data);
        } else if (this.refreshAccessTokens) {
          return resolve(this.refreshAccessToken(refreshToken, 0));
        } else {
          return reject(new Error('unable to refresh token'));
        }
      } else {
        // The refresh token might not be expired, we can't test this on the client so attempt to refresh the token. If the server rejects the token the user session will be invalidated
        if (this.refreshAccessTokens) {
          return resolve(this.refreshAccessToken(refreshToken, 0));
        } else {
          return reject(new Error('token is expired'));
        }
      }
    });
  },

  /**
    Authenticates the session with the specified `credentials`.

    It will return a resolving promise if it successfully posts a request to the `JWT.serverTokenEndpoint` with the valid credentials.

    An automatic token refresh will be scheduled with the new expiration date from the returned refresh token. That expiration will be merged with the response and the promise resolved.

    @method authenticate
    @param {Object} credentials Credentials to authenticate the session with
    @param {Object} headers Headers to send with the authentication request
    @return {Promise} Promise that resolves when an auth token is successfully acquired from the server and rejects otherwise
  */
  authenticate(credentials, headers) {
    return this.makeRequest(this.serverTokenEndpoint, credentials, assign({}, this.headers, headers)).then(response => {
      return this.handleAuthResponse(response.json);
    });
  },

  /**
    Schedules a token refresh request to be sent to the backend after a calculated `wait` time has passed.

    If both `token` and `expiresAt` are non-empty, and `expiresAt` minus the optional refres leeway is greater than the calculated `now`, the token refresh will be scheduled through later.

    @method scheduleAccessTokenRefresh
    @param {Integer} expiresAt Timestamp when the token expires
    @param {String} refreshToken Refresh token
  */
  scheduleAccessTokenRefresh(expiresAt, refreshToken) {
    if (this.refreshAccessTokens) {

      const now = this.getCurrentTime();
      const wait = (expiresAt - now - this.refreshLeeway) * 1000;

      if (!isEmpty(refreshToken) && !isEmpty(expiresAt)) {
        if (wait > 0) {
          cancel(this._refreshTokenTimeout);
          delete this._refreshTokenTimeout;
          this._refreshTokenTimeout = later(this, this.refreshAccessToken, refreshToken, 0, wait);
        } else if (expiresAt > now) {
          throw new Error('refreshLeeway is too large which is preventing token refresh.');
        }
      }
    }
  },

  /**
    Makes a refresh token request to grab a new authenticated JWT token from the server.

    It will return a resolving promise if a successful POST is made to the `JWT.serverTokenRefreshEndpoint`.

    After the new token is obtained it will schedule the next automatic token refresh based on the new `expiresAt` time.

    The session will be updated via the trigger `sessionDataUpdated`.

    @method refreshAccessToken
    @param {String} refreshToken Refresh token
    @param {Integer} attempts Number of attempts that have been made so far
    @return {Promise} Promise that resolves when an auth token is successfully acquired from the server and rejects otherwise
  */
  refreshAccessToken(refreshToken, attempts) {
    const data = this.makeRefreshData(refreshToken);

    return this.makeRequest(this.serverTokenRefreshEndpoint, data, this.headers).then(response => {
      const sessionData = this.handleAuthResponse(response.json);
      this.trigger('sessionDataUpdated', sessionData);
      return sessionData;
    }).catch(error => {
      this.handleTokenRefreshFail(error.status, refreshToken, attempts);
      return Promise.reject(error);
    });
  },

  /**
    Returns a nested object with the token property name.
    Example:  If `refreshTokenPropertyName` is "data.user.refreshToken", `makeRefreshData` will return {data: {user: {refreshToken: "token goes here"}}}

    @method makeRefreshData
    @param {String} refreshToken Refresh token
    @return {object} Object with the nested property name.
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
    @param {String} token Token
    @return {object} Object with properties for the session.
  */
  getTokenData(token) {
    const payload = token.split('.')[1];
    const decodedPayload = decode(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const tokenData = decodeURIComponent(window.escape(decodedPayload));

    try {
      return JSON.parse(tokenData);
    } catch (error) {
      return tokenData;
    }
  },

  /**
    Cancels any outstanding automatic token refreshes and returns a resolving promise.

    @method invalidate
    @return {Promise} Resolving promise
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
    @param {Object} response Response body
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
    Handles token refresh fail status. If the server response to a token refresh has a status of 401 or 403 then the token in the session will be invalidated and the sessionInvalidated provided by ember-simple-auth will be triggered.

    @method handleTokenRefreshFail
    @param {Integer} refreshStatusCode Status code received when attempting to refresh token
    @param {String} refreshToken Refresh token
    @param {Integer} attempts Number of attempts that have been made so far
  */
  handleTokenRefreshFail(refreshStatusCode, refreshToken, attempts) {
    if (this.tokenRefreshInvalidateSessionResponseCodes.includes(refreshStatusCode)) {
      return this.invalidate().then(() => {
        this.trigger('sessionDataInvalidated');
      });
    } else if (attempts++ < this.refreshAccessTokenRetryAttempts) {
      cancel(this._refreshTokenTimeout);
      delete this._refreshTokenTimeout;
      this._refreshTokenTimeout = later(this, this.refreshAccessToken, refreshToken, attempts, this.refreshAccessTokenRetryTimeout);
    } else if (this.tokenRefreshFailInvalidateSession) {
      return this.invalidate().then(() => {
        this.trigger('sessionDataInvalidated');
      });
    }
  },

  /**
    Schedules session invalidation at the time token expires.

    @method scheduleAccessTokenExpiration
    @param {Integer} expiresAt Timestamp when the token expires
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
  */
  handleAccessTokenExpiration() {
    return this.invalidate().then(() => {
      this.trigger('sessionDataInvalidated');
    });
  }
});
