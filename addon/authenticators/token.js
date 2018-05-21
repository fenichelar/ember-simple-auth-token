import EmberObject from '@ember/object';
import $ from 'jquery';
import { Promise, resolve } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';
import Base from 'ember-simple-auth/authenticators/base';
import config from 'ember-get-config';

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
    @method init
    @private
  */
  init() {
    this._super(...arguments);
    const conf = config['ember-simple-auth-token'] || {};
    this.serverTokenEndpoint = conf.serverTokenEndpoint || '/api/token-auth/';
    this.tokenPropertyName = conf.tokenPropertyName || 'token';
    this.headers = conf.headers || {};
  },

  /**
    Restores the session from a set of session properties; __will return a
    resolving promise when there's a non-empty `token` in the
    `properties`__ and a rejecting promise otherwise.

    @method restore
    @param {Object} properties The properties to restore the session from
    @return {Promise} A promise that when it resolves results in the session being authenticated
  */
  restore(properties) {
    const propertiesObject = EmberObject.create(properties);

    return new Promise((resolve, reject) => {
      if (!isEmpty(propertiesObject.get(this.tokenPropertyName))) {
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
    @return {Promise} A promise that resolves when an auth token is successfully acquired from the server and rejects otherwise
  */
  authenticate(credentials, headers) {
    return new Promise((resolve, reject) => {
      this.makeRequest(this.serverTokenEndpoint, credentials, headers).then(response => {
        run(() => {
          resolve(this.getResponseData(response));
        });
      }, xhr => {
        run(() => { reject(xhr.responseJSON || xhr.responseText); });
      });
    });
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
    @return {Promise} A resolving promise
  */
  invalidate() {
    return resolve();
  },

  /**
    @method makeRequest
    @param {Object} url Server endpoint
    @param {Object} data Object that will be sent to server
    @param {Object} headers Additional headers that will be sent to server
    @private
  */
  makeRequest(url, data, headers) {
    return $.ajax({
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
          Object.keys(headers).forEach(key => {
            xhr.setRequestHeader(key, headers[key]);
          });
        }
      }
    });
  }
});
