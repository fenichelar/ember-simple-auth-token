import Ember from 'ember';
import Base from 'ember-simple-auth/authenticators/base';
import Configuration from '../configuration';

/**
  Authenticator that works with token-based authentication like JWT.

  _The factory for this authenticator is registered as
  `'authenticator:token'` in Ember's container._

  @class Token
  @namespace SimpleAuth.Authenticators
  @module ember-simple-auth-token/authenticators/token
  @extends Base
*/
export default Base.extend({
  /**
    The endpoint on the server the authenticator acquires the auth token from.

    This value can be configured via
    [`SimpleAuth.Configuration.Token#serverTokenEndpoint`](#SimpleAuth-Configuration-Token-serverTokenEndpoint).

    @property serverTokenEndpoint
    @type String
    @default '/api/token-auth/'
  */
  serverTokenEndpoint: '/api/token-auth/',

  /**
    The attribute-name that is used for the identification field when sending the
    authentication data to the server.

    This value can be configured via
    [`SimpleAuth.Configuration.Token#identificationField`](#SimpleAuth-Configuration-Token-identificationField).

    @property identificationField
    @type String
    @default 'username'
  */
  identificationField: 'username',

  /**
    The attribute-name that is used for the password field when sending the
    authentication data to the server.

    This value can be configured via
    [`SimpleAuth.Configuration.Token#passwordfield`](#SimpleAuth-Configuration-Token-passwordfield).

    @property passwordField
    @type String
    @default 'password'
  */
  passwordField: 'password',

  /**
    The name of the property in session that contains token used for authorization.

    This value can be configured via
    [`SimpleAuth.Configuration.Token#tokenPropertyName`](#SimpleAuth-Configuration-Token-tokenPropertyName).

    @property tokenPropertyName
    @type String
    @default 'token'
  */
  tokenPropertyName: 'token',

  /**
    The property that stores custom headers that will be sent on every request.

    This value can be configured via
    [`SimpleAuth.Configuration.Token#headers`](#SimpleAuth-Configuration-Token-headers).

    @property headers
    @type Object
    @default {}
  */
  headers: {},

  /**
    @method init
    @private
  */
  init() {
    this.serverTokenEndpoint = Configuration.serverTokenEndpoint;
    this.identificationField = Configuration.identificationField;
    this.passwordField = Configuration.passwordField;
    this.tokenPropertyName = Configuration.tokenPropertyName;
    this.headers = Configuration.headers;
  },

  /**
    Restores the session from a set of session properties; __will return a
    resolving promise when there's a non-empty `token` in the
    `properties`__ and a rejecting promise otherwise.

    @method restore
    @param {Object} properties The properties to restore the session from
    @return {Ember.RSVP.Promise} A promise that when it resolves results in the session being authenticated
  */
  restore(properties) {
    const propertiesObject = Ember.Object.create(properties);

    return new Ember.RSVP.Promise((resolve, reject) => {
      if (!Ember.isEmpty(propertiesObject.get(this.tokenPropertyName))) {
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
    @param {Object} credentials The credentials to authenticate the session with
    @param {Object} headers Additional headers to pass with request
    @return {Ember.RSVP.Promise} A promise that resolves when an auth token is successfully acquired from the server and rejects otherwise
  */
  authenticate(credentials, headers) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      const data = this.getAuthenticateData(credentials);

      this.makeRequest(data, headers).then(response => {
        Ember.run(() => {
          resolve(this.getResponseData(response));
        });
      }, xhr => {
        Ember.run(() => { reject(xhr.responseJSON || xhr.responseText); });
      });
    });
  },

  /**
    Returns an object used to be sent for authentication.

    @method getAuthenticateData
    @return {object} An object with properties for authentication.
  */
  getAuthenticateData(credentials) {
    const authentication = {
      [this.passwordField]: credentials[this.passwordField],
      [this.identificationField]: credentials[this.identificationField]
    };

    return authentication;
  },

  /**
    Returns an object with properties the `authenticate` promise will resolve,
    be saved in and accessible via the session.

    @method getResponseData
    @return {object} An object with properties for the session.
  */
  getResponseData(response) {
    return response;
  },

  /**
    Does nothing

    @method invalidate
    @return {Ember.RSVP.Promise} A resolving promise
  */
  invalidate() {
    return Ember.RSVP.resolve();
  },

  /**
    @method makeRequest
    @param {Object} data Object that will be sent to server
    @param {Object} headers Additional headers that will be sent to server
    @private
  */
  makeRequest(data, headers) {
    return Ember.$.ajax({
      url: this.serverTokenEndpoint,
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
          Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
          });
        }
      }
    });
  }
});
