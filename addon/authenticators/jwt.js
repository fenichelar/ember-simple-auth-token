import Ember from 'ember';
import Configuration from '../configuration';
import TokenAuthenticator from './token';

const assign = Ember.assign || Ember.merge;

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
    The endpoint on the server for refreshing a token.
    @property serverTokenRefreshEndpoint
    @type String
    @default '/api/token-refresh/'
  */
  serverTokenRefreshEndpoint: '/api/token-refresh/',

  /**
    Sets whether the authenticator automatically refreshes access tokens.
    @property refreshAccessTokens
    @type Boolean
    @default true
  */
  refreshAccessTokens: true,

  /**
    The number of seconds to subtract from the token's time of expiration when
    scheduling the automatic token refresh call.
    @property refreshLeeway
    @type Integer
    @default 0 (seconds)
  */
  refreshLeeway: 0,

  /**
    The amount of time to wait before refreshing the token - set automatically.
    @property refreshTokenTimeout
    @private
  */
  refreshTokenTimeout: null,

  /**
    The name for which decoded token field represents the token expire time.
    @property tokenExpireName
    @type String
    @default 'exp'
  */
  tokenExpireName: 'exp',

  /**
    @method init
    @private
  */
  init() {
    this.serverTokenEndpoint = Configuration.serverTokenEndpoint;
    this.serverTokenRefreshEndpoint = Configuration.serverTokenRefreshEndpoint;
    this.identificationField = Configuration.identificationField;
    this.passwordField = Configuration.passwordField;
    this.tokenPropertyName = Configuration.tokenPropertyName;
    this.refreshTokenPropertyName = Configuration.refreshTokenPropertyName;
    this.refreshAccessTokens = Configuration.refreshAccessTokens;
    this.refreshLeeway = Configuration.refreshLeeway;
    this.tokenExpireName = Configuration.tokenExpireName;
    this.headers = Configuration.headers;
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
    @return {Ember.RSVP.Promise} A promise that when it resolves results
                                 in the session being authenticated
  */
  restore(data) {
    const dataObject = Ember.Object.create(data);

    return new Ember.RSVP.Promise((resolve, reject) => {
      const now = this.getCurrentTime();
      const token = dataObject.get(this.tokenPropertyName);
      const refreshToken = dataObject.get(this.refreshTokenPropertyName);
      let expiresAt = dataObject.get(this.tokenExpireName);

      if (Ember.isEmpty(token)) {
        return reject(new Error('empty token'));
      }

      if (Ember.isEmpty(expiresAt)) {
        // Fetch the expire time from the token data since `expiresAt`
        // wasn't included in the data object that was passed in.
        const tokenData = this.getTokenData(token);

        expiresAt = tokenData[this.tokenExpireName];
        if (Ember.isEmpty(expiresAt)) {
          return resolve(data);
        }
      }

      if (expiresAt > now) {
        const wait = (expiresAt - now - this.refreshLeeway) * 1000;

        this.scheduleAccessTokenExpiration(expiresAt);

        if (wait > 0) {
          if (this.refreshAccessTokens) {
            this.scheduleAccessTokenRefresh(dataObject.get(this.tokenExpireName), refreshToken);
          }
          resolve(data);
        } else if (this.refreshAccessTokens) {
          resolve(this.refreshAccessToken(refreshToken));
        } else {
          reject(new Error('unable to refresh token'));
        }
      } else {
        // the refresh token might not be expired,
        // we can't test this on the client so attempt to refresh the token.
        // If the server rejects the token the user session will be invalidated
        if (this.refreshAccessTokens) {
          resolve(this.refreshAccessToken(refreshToken));
        } else {
          reject(new Error('token is expired'));
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
    @param {Object} headers Additional headers to be sent to server
    @return {Ember.RSVP.Promise} A promise that resolves when an auth token is
                                 successfully acquired from the server and rejects
                                 otherwise
  */
  authenticate(credentials, headers) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const data = this.getAuthenticateData(credentials);

      this.makeRequest(this.serverTokenEndpoint, data, headers)
        .then((response) => {
          Ember.run(() => {
            try {
              const sessionData = this.handleAuthResponse(response);

              resolve(sessionData);
            } catch (error) {
              reject(error);
            }
          });
        }, (xhr) => {
          Ember.run(() => { reject(xhr.responseJSON || xhr.responseText); });
        });
    });
  },

  /**
    Schedules a token refresh request to be sent to the backend after a calculated
    `wait` time has passed.

    If both `token` and `expiresAt` are non-empty, and `expiresAt` minus the optional
    refres leeway is greater than the calculated `now`, the token refresh will be scheduled
    through Ember.run.later.

    @method scheduleAccessTokenRefresh
    @private
  */
  scheduleAccessTokenRefresh(expiresAt, refreshToken) {
    if (this.refreshAccessTokens) {

      const now = this.getCurrentTime();
      const wait = (expiresAt - now - this.refreshLeeway) * 1000;

      if (!Ember.isEmpty(refreshToken) && !Ember.isEmpty(expiresAt) && wait > 0) {
        Ember.run.cancel(this._refreshTokenTimeout);
        delete this._refreshTokenTimeout;
        this._refreshTokenTimeout = Ember.run.later(this, this.refreshAccessToken, refreshToken, wait);
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
  refreshAccessToken(token, headers) {
    const data = this.makeRefreshData(token);

    return new Ember.RSVP.Promise((resolve, reject) => {
      this.makeRequest(this.serverTokenRefreshEndpoint, data, headers)
        .then((response) => {
          Ember.run(() => {
            try {
              const sessionData = this.handleAuthResponse(response);

              this.trigger('sessionDataUpdated', sessionData);
              resolve(sessionData);
            } catch (error) {
              reject(error);
            }
          });
        }, (xhr, status, error) => {
          Ember.Logger.warn(
            'Access token could not be refreshed - ' +
            `server responded with ${error}.`
          );

          this.handleTokenRefreshFail(xhr.status);

          reject();
        });
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

    let lastObject = data;
    const nestings = this.refreshTokenPropertyName.split('.');
    const refreshTokenPropertyName = nestings.pop();

    nestings.forEach((nesting) => {
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
    const tokenData = decodeURIComponent(window.escape(atob(payload)));

    try {
      return JSON.parse(tokenData);
    } catch (e) {
      return tokenData;
    }
  },

  /**
    Accepts a `url` and `data` to be used in an ajax server request.

    @method makeRequest
    @private
  */
  makeRequest(url, data, headers) {
    return Ember.$.ajax({
      url: url,
      method: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      headers: this.headers,
      beforeSend: (xhr, settings) => {
        if(this.headers['Accept'] === null || this.headers['Accept'] === undefined) {
          xhr.setRequestHeader('Accept', settings.accepts.json);
        }

        if (headers) {
          Object.keys(headers).forEach((key) => {
            xhr.setRequestHeader(key, headers[key]);
          });
        }
      }
    });
  },

  /**
    Schedules session invalidation at the time token expires.

    @method scheduleAccessTokenExpiration
    @private
  */
  scheduleAccessTokenExpiration(expiresAt) {
    const now = this.getCurrentTime();
    const wait = Math.max((expiresAt - now) * 1000, 0);

    if (!Ember.isEmpty(expiresAt)) {
      Ember.run.cancel(this._tokenExpirationTimeout);
      delete this._tokenExpirationTimeout;
      this._tokenExpirationTimeout = Ember.run.later(this, this.handleAccessTokenExpiration, wait);
    }
  },

  /**
    Cancels any outstanding automatic token refreshes and returns a resolving
    promise.
    @method invalidate
    @param {Object} data The data of the session to be invalidated
    @return {Ember.RSVP.Promise} A resolving promise
  */
  invalidate() {
    Ember.run.cancel(this._refreshTokenTimeout);
    delete this._refreshTokenTimeout;
    Ember.run.cancel(this._tokenExpirationTimeout);
    delete this._tokenExpirationTimeout;
    return new Ember.RSVP.resolve();
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
    const token = Ember.get(response, this.tokenPropertyName);

    if (Ember.isEmpty(token)) {
      throw new Error('Token is empty. Please check your backend response.');
    }

    const tokenData = this.getTokenData(token);
    const expiresAt = Ember.get(tokenData, this.tokenExpireName);
    const tokenExpireData = {};

    tokenExpireData[this.tokenExpireName] = expiresAt;
    this.scheduleAccessTokenExpiration(expiresAt);

    if (this.refreshAccessTokens) {
      const refreshToken = Ember.get(response, this.refreshTokenPropertyName);

      if (Ember.isEmpty(refreshToken)) {
        throw new Error('Refresh token is empty. Please check your backend response.');
      }

      this.scheduleAccessTokenRefresh(expiresAt, refreshToken);
    }

    return assign(this.getResponseData(response), tokenExpireData);
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
    Handles access token expiration. After token expiration the session will
    be invalidated and the sessionInvalidated provided by ember-simple-auth
    will be triggered.

    @method handleAccessTokenExpiration
    @private
  */
  handleAccessTokenExpiration() {
    return this.invalidate().then(() => {
        this.trigger('sessionDataInvalidated');
    });
  }
});
