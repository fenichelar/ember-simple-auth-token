import EmberObject from '@ember/object';
import fetch from 'fetch';
import { assign } from '@ember/polyfills';
import { Promise, reject, resolve } from 'rsvp';
import { isEmpty } from '@ember/utils';
import Base from 'ember-simple-auth/authenticators/base';
import config from 'ember-get-config';

/**
  Authenticator that works with token-based authentication like JWT.

  _The factory for this authenticator is registered as `'authenticator:token'` in Ember's container._

  @class Token
  @namespace SimpleAuth.Authenticators
  @module ember-simple-auth-token/authenticators/token
  @extends Base
*/
export default Base.extend({
  /**
    @method init
  */
  init() {
    this._super(...arguments);
    const conf = config['ember-simple-auth-token'] || {};
    this.serverTokenEndpoint = conf.serverTokenEndpoint || '/api/token-auth/';
    this.tokenPropertyName = conf.tokenPropertyName || 'token';
    this.headers = conf.headers || {};
  },

  /**
    Restores the session from a set of session properties; __will return a resolving promise when there's a non-empty `token` in the `properties`__ and a rejecting promise otherwise.

    @method restore
    @param {Object} properties The properties to restore the session from
    @return {Promise} A promise that when it resolves results in the session being authenticated
  */
  restore(properties) {
    const propertiesObject = EmberObject.create(properties);

    return new Promise((resolve, reject) => {
      if (!isEmpty(propertiesObject.get(this.tokenPropertyName))) {
        return resolve(properties);
      } else {
        return reject();
      }
    });
  },

  /**
    Authenticates the session with the specified `credentials`; the credentials are `POST`ed to the [`Authenticators.Token#serverTokenEndpoint`](#SimpleAuth-Authenticators-Token-serverTokenEndpoint) and if they are valid the server returns an auth token in response. __If the credentials are valid and authentication succeeds, a promise that resolves with the server's response is returned__, otherwise a promise that rejects with the server error is returned.

    @method authenticate
    @param {Object} credentials The credentials to authenticate the session with
    @param {Object} headers Optional headers to send with the authentication request
    @return {Promise} A promise that resolves when an auth token is successfully acquired from the server and rejects otherwise
  */
  authenticate(credentials, headers) {
    return this.makeRequest(this.serverTokenEndpoint, credentials, assign({}, this.headers, headers)).then(response => {
      return response.json;
    });
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
  */
  makeRequest(url, data, headers) {
    return fetch(url, {
      method: 'POST',
      headers: assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, headers),
      body: JSON.stringify(data)
    }).then(response => {
      const res = {
        statusText: response.statusText,
        status: response.status,
        headers: response.headers
      };

      return response.text().then(text => {
        res.text = text;
        try {
          res.json = JSON.parse(text);
        } catch (e) {
          return reject(res);
        }

        if (response.ok) {
          return res;
        } else {
          return reject(res);
        }
      }).catch(() => {
        return reject(res);
      });
    });
  }
});
