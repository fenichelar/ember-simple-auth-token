import Ember from 'ember';
import Configuration from '../configuration';
import TokenAuthenticator from './token';

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
    Default time unit.
    @property timeFactor
    @type Integer
    @default 1 (seconds)
  */
  timeFactor: 1,

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
    this.refreshAccessTokens = Configuration.refreshAccessTokens;
    this.refreshLeeway = Configuration.refreshLeeway;
    this.tokenExpireName = Configuration.tokenExpireName;
    this.timeFactor = Configuration.timeFactor;
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
    // const tokenData = Ember.Object.create(data.data.attributes)

    return new Ember.RSVP.Promise((resolve, reject) => {
      // const token = dataObject.get(this.tokenPropertyName); //theirs
      // const token = tokenData.get(this.tokenPropertyName); //mine
      const now = this.getCurrentTime();
      const token = Ember.get(dataObject.data.attributes, this.tokenPropertyName);
      let expiresAt = this.resolveTime(dataObject.get(this.tokenExpireName));

      if (Ember.isEmpty(token)) {
        return reject(new Error('empty token'));
      }
      if (Ember.isEmpty(expiresAt)) {
        // Fetch the expire time from the token data since `expiresAt`
        // wasn't included in the data object that was passed in.
        const tokenData = this.getTokenData(data[this.tokenPropertyName]);

        expiresAt = this.resolveTime(tokenData[this.tokenExpireName]);
        if (Ember.isEmpty(expiresAt)) {
          return resolve(data);
        }
      }

      if (expiresAt > now) {
        const wait = expiresAt - now - (this.refreshLeeway * 1000);

        if (wait > 0) {
          if (this.refreshAccessTokens) {
            this.scheduleAccessTokenRefresh(dataObject.get(this.tokenExpireName), token);
          }
          resolve(data);
        } else if (this.refreshAccessTokens) {
          resolve(this.refreshAccessToken(token).then(() => { return data; }));
        } else {
          reject(new Error('unable to refresh token'));
        }
      } else {
        reject(new Error('token is expired'));
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

      this.makeRequest(this.serverTokenEndpoint, data, headers).then(response => {
        Ember.run(() => {
          // our token is in data.attributes['auth-token']
          const token = Ember.get(response.data.attributes, this.tokenPropertyName);
          // const token = Ember.get(response, this.tokenPropertyName); // this doesn't work
          const tokenData = this.getTokenData(token);
          const expiresAt = Ember.get(tokenData, this.tokenExpireName);
          const tokenExpireData = {};

          this.scheduleAccessTokenRefresh(expiresAt, token);

          tokenExpireData[this.tokenExpireName] = expiresAt;

          response = Ember.merge(response, tokenExpireData);

          resolve(this.getResponseData(response));
        });
      }, xhr => {
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
  scheduleAccessTokenRefresh(expiresAt, token) {
    if (this.refreshAccessTokens) {
      expiresAt = this.resolveTime(expiresAt);

      const now = this.getCurrentTime();
      const wait = expiresAt - now - (this.refreshLeeway * 1000);

      if (!Ember.isEmpty(token) && !Ember.isEmpty(expiresAt) && wait > 0) {
        Ember.run.cancel(this._refreshTokenTimeout);

        delete this._refreshTokenTimeout;

        this._refreshTokenTimeout = Ember.run.later(this, this.refreshAccessToken, token, wait);
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
    let data = {
      [this.tokenPropertyName]: token
    };

    return new Ember.RSVP.Promise((resolve, reject) => {
      this.makeRequest(this.serverTokenRefreshEndpoint, data, headers).then(response => {
        Ember.run(() => {
          const resToken = Ember.get(response, this.tokenPropertyName);
          const tokenData = this.getTokenData(resToken);
          const expiresAt = Ember.get(tokenData, this.tokenExpireName);
          const tokenExpireData = {};

          tokenExpireData[this.tokenExpireName] = expiresAt;

          data = Ember.merge(response, tokenExpireData);

          this.scheduleAccessTokenRefresh(expiresAt, resToken);
          this.trigger('sessionDataUpdated', data);

          resolve(response);
        });
      }, (xhr, status, error) => {
        Ember.Logger.warn(`Access token could not be refreshed - server responded with ${error}.`);
        reject();
      });
    });
  },

  /**
    Returns the decoded token with accessible returned values.

    @method getTokenData
    @return {object} An object with properties for the session.
  */
  getTokenData(token) {
    const tokenData = atob(token.split('.')[1]);

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
        xhr.setRequestHeader('Accept', settings.accepts.json);

        if (headers) {
          Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
          });
        }
      }
    });
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

    return new Ember.RSVP.resolve();
  },

  getCurrentTime() {
    return (new Date()).getTime();
  },

  /**
    Handles converting between time units for data between different systems.
    Default: seconds(1)
    @method resolveTime
    @private
  */
  resolveTime(time) {
    if (Ember.isEmpty(time)) {
      return time;
    }
    return new Date(time * this.timeFactor).getTime();
  }
});
