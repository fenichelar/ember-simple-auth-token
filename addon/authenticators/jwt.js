import Ember from 'ember';
import Configuration from '../configuration';
import TokenAuthenticator from './token';

/**
  Extended Token Authenticator that includes refresh by default.

  _The factory for this authenticator is registered as
  `'simple-auth-authenticator:jwt'` in Ember's container._

  @class Jwt
  @namespace SimpleAuth.Authenticators
  @module simple-auth-token/authenticators/jwt
  @extends TokenAuthenticator
*/
export default TokenAuthenticator.extend({
  /**
    The endpoint on the server for refreshing a token.
    @property serverTokenRefreshEndpoint
    @type String
    @default '/api-token-refresh/'
  */
  serverTokenRefreshEndpoint: '/api-token-refresh/',

  /**
    Sets whether the authenticator automatically refreshes access tokens.
    @property refreshAccessTokens
    @type Boolean
    @default true
  */
  refreshAccessTokens: true,

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
  init: function() {
    this.serverTokenEndpoint = Configuration.serverTokenEndpoint;
    this.serverTokenRefreshEndpoint = Configuration.serverTokenRefreshEndpoint;
    this.identificationField = Configuration.identificationField;
    this.tokenPropertyName = Configuration.tokenPropertyName;
    this.refreshAccessTokens = Configuration.refreshAccessTokens;
    this.tokenExpireName = Configuration.tokenExpireName;
    this.timeFactor = Configuration.timeFactor;
  },

  /**
    Restores the session from a set of session properties; __will return a
    resolving promise when there's a non-empty `token` in the `data`__
    and a rejecting promise otherwise.
    This method also schedules automatic token refreshing when there are values
    for `token` and `expiresAt` in the `data` and automatic token
    refreshing is not disabled.
    @method restore
    @param {Object} data The data to restore the session from
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being authenticated
  */
  restore: function(data){
    var _this = this;
    return new Ember.RSVP.Promise(function(resolve, reject){
      var now = (new Date()).getTime();
      if(!Ember.isEmpty(data.expiresAt) && !Ember.isEmpty(data.token) && data.expiresAt < now){
        if(_this.refreshAccessTokens){
          _this.refreshAccessToken(data.token).then(function(data){
            resolve(data);
          }, reject());
        }else{
          reject();
        }
      }else{
        if(Ember.isEmpty(data.token)){
          reject();
        }else{
          var tokenData = _this.getTokenData({'token': data.token}),
            tokenExpiresAt = tokenData[_this.tokenExpireName],
            expiresAt = _this.resolveTime(tokenExpiresAt);
          _this.scheduleAccessTokenRefresh(expiresAt, data.token);
          resolve(data);
        }
      }
    });
  },

  /**
    Authenticates the session with the specified `credentials`; the credentials
    are `POST`ed to the
    [`Authenticators.Token#serverTokenEndpoint`](#SimpleAuth-Authenticators-Token-serverTokenEndpoint)
    and if they are valid the server returns an auth token in
    response. __If the credentials are valid and authentication succeeds, a
    promise that resolves with the server's response is returned__, otherwise a
    promise that rejects with the server error is returned.

    @method authenticate
    @param {Object} options The credentials to authenticate the session with
    @return {Ember.RSVP.Promise} A promise that resolves when an auth token is successfully acquired from the server and rejects otherwise
  */
  authenticate: function(credentials) {
    var _this = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var data = _this.getAuthenticateData(credentials);
      _this.makeRequest(_this.serverTokenEndpoint, data).then(function(response) {
        Ember.run(function() {
          var tokenData = _this.getTokenData(response),
              expiresAt = tokenData[_this.tokenExpireName];
          _this.scheduleAccessTokenRefresh(expiresAt, response.token);          
          response = Ember.merge(response, { expiresAt: expiresAt });
          resolve(_this.getResponseData(response));
        });
      }, function(xhr) {
        Ember.run(function() {
          reject(xhr.responseJSON || xhr.responseText);
        });
      });
    });
  },

  /**
    @method scheduleAccessTokenRefresh
    @private
  */
  scheduleAccessTokenRefresh: function(expiresAt, token) {
    if(this.refreshAccessTokens){
      expiresAt = this.resolveTime(expiresAt);
      var now = (new Date()).getTime(),
        wait = expiresAt - now;
      if(!Ember.isEmpty(token) && !Ember.isEmpty(expiresAt) && expiresAt > now){
        Ember.run.cancel(this._refreshTokenTimeout);
        delete this._refreshTokenTimeout;
        if(!Ember.testing){
          this._refreshTokenTimeout = Ember.run.later(this, this.refreshAccessToken, token, wait);
        }
      }
    }
  },

  /**
    @method refreshAccessToken
    @private
  */
  refreshAccessToken: function(token) {
    var _this = this;
    var data  = {token: token};
    return new Ember.RSVP.Promise(function(resolve, reject) {
      _this.makeRequest(_this.serverTokenRefreshEndpoint, data).then(function(response) {
        Ember.run(function() {
          var tokenData = _this.getTokenData(response),
            expiresAt = tokenData[_this.tokenExpireName],
            data = Ember.merge(response, {expiresAt: expiresAt});
          _this.scheduleAccessTokenRefresh(expiresAt, response.token);
          _this.trigger('sessionDataUpdated', data);
          resolve(response);
        });
      }, function(xhr, status, error) {
        Ember.Logger.warn('Access token could not be refreshed - server responded with ' + error + '.');
        reject();
      });
    });
  },

  /**
    Returns the decoded token with accessible returned values.

    @method getTokenData
    @return {object} An object with properties for the session.
  */
  getTokenData: function(response) {
    var token = response.token.split('.');
    
    if(token.length > 1){
      token = token[1];
    }else{
      token = token[0];
    }

    return JSON.parse(atob(token));
  },

  /**
    @method makeRequest
    @private
  */
  makeRequest: function(url, data) {
    return Ember.$.ajax({
      url: url,
      type: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      beforeSend: function(xhr, settings) {
        xhr.setRequestHeader('Accept', settings.accepts.json);
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
  invalidate: function() {
    Ember.run.cancel(this._refreshTokenTimeout);
    delete this._refreshTokenTimeout;
    return new Ember.RSVP.resolve();
  }, 

  /**
    Handles converting between time units for data between different systems.
    Default: seconds(1)
    @method resolveTime
    @private
  */
  resolveTime: function(time){
    return new Date(time * this.timeFactor).getTime();
  },
});
