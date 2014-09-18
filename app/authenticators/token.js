import Ember from 'ember';
import Base from 'simple-auth/authenticators/base';
import getGlobalConfig from './../utils/get-global-config';
import isSecureUrl from './../utils/is-secure-url';

/**
  Authenticator that works with token-based authentication like JWT.

  _The factory for this authenticator is registered as
  `'simple-auth-authenticator:token'` in Ember's container._

  @class Token
  @namespace SimpleAuth.Authenticators
  @module simple-auth-token/authenticators/token
  @extends Base
*/
export default Base.extend({
  /**
    The endpoint on the server the authenticator acquires the auth token from.

    This value can be configured via the global environment object:

    ```js
    window.ENV = window.ENV || {};
    window.ENV['simple-auth-token'] = {
      serverTokenEndpoint: '/some/other/endpoint'
    }
    ```

    @property serverTokenEndpoint
    @type String
    @default '/users/sign_in'
  */
  serverTokenEndpoint: '/api-token-auth/',

  /**
    The attribute-name that is used for the identification field when sending the 
    authentication data to the server.

    This value can be configured via the global environment object:

    ```js
    window.ENV = window.ENV || {};
    window.ENV['simple-auth-token'] = {
      identificationField: 'email'
    }
    ```

    @property identificationField
    @type String
    @default 'username'
  */
  identificationField: 'username',

  /**
    @method init
    @private
  */
  init: function() {
    var globalConfig = getGlobalConfig('simple-auth-token');
    this.serverTokenEndpoint = globalConfig.serverTokenEndpoint || this.serverTokenEndpoint;
    this.identificationField = globalConfig.identificationField || this.identificationField;
  },

  /**
    Restores the session from a set of session properties; __will return a
    resolving promise when there's a non-empty `token` in the
    `properties`__ and a rejecting promise otherwise.

    @method restore
    @param {Object} properties The properties to restore the session from
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being authenticated
  */
  restore: function(properties) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!Ember.isEmpty(properties.token)) {
        resolve(properties);
      } else {
        reject();
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
      _this.makeRequest(data).then(function(response) {
        Ember.run(function() {
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
    Returns an object used to be sent for authentication.

    @method getAuthenticateData
    @return {object} An object with properties for authentication.
  */
  getAuthenticateData: function(credentials) {
    var authentication = {
      password: credentials.password
    };

    authentication[this.identificationField] = credentials.identification

    return authentication;
  },

  /**
    Returns an object with properties the `authenticate` promise will resolve,
    be saved in and accessible via the session.

    @method getResponseData
    @return {object} An object with properties for the session.
  */
  getResponseData: function(response) {
    return response;
  },

  /**
    Does nothing

    @method invalidate
    @return {Ember.RSVP.Promise} A resolving promise
  */
  invalidate: function() {
    return Ember.RSVP.resolve();
  },

  /**
    @method makeRequest
    @private
  */
  makeRequest: function(data) {
    if (!isSecureUrl(this.serverTokenEndpoint)) {
      Ember.Logger.warn('Credentials are transmitted via an insecure connection - use HTTPS to keep them secure.');
    }
    return Ember.$.ajax({
      url: this.serverTokenEndpoint,
      type: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json',
      beforeSend: function(xhr, settings) {
        xhr.setRequestHeader('Accept', settings.accepts.json);
      }
    });
  }
});
