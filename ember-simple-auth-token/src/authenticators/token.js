import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { Promise, reject, resolve } from 'rsvp';
import { isEmpty } from '@ember/utils';
import Base from 'ember-simple-auth/authenticators/base';

/**
  Authenticator that works with token-based authentication like JWT.

  _The factory for this authenticator is registered as `'authenticator:token'` in Ember's container._

  @class Token
  @namespace SimpleAuth.Authenticators
  @module ember-simple-auth-token/authenticators/token
  @extends Base
*/
export default class TokenAuthenticator extends Base {
  constructor(...args) {
    super(...args);
    const owner = getOwner(this);
    const environment = owner
      ? owner.resolveRegistration('config:environment') || {}
      : {};
    const config = environment['ember-simple-auth-token'] || {};
    this.serverTokenEndpoint = config.serverTokenEndpoint || '/api/token-auth/';
    this.tokenPropertyName = config.tokenPropertyName || 'token';
    this.headers = config.headers || {};
  }

  /**
    Restores the session from a set of session properties; __will return a resolving promise when there's a non-empty `token` in the `properties`__ and a rejecting promise otherwise.

    @method restore
    @param {Object} properties Properties to restore the session from
    @return {Promise} Promise that when it resolves results in the session being authenticated
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
  }

  /**
    Authenticates the session with the specified `credentials`; the credentials are `POST`ed to the [`Authenticators.Token#serverTokenEndpoint`](#SimpleAuth-Authenticators-Token-serverTokenEndpoint) and if they are valid the server returns an auth token in response. __If the credentials are valid and authentication succeeds, a promise that resolves with the server's response is returned__, otherwise a promise that rejects with the server error is returned.

    @method authenticate
    @param {Object} credentials Credentials to authenticate the session with
    @param {Object} headers Headers to send with the authentication request
    @return {Promise} Promise that resolves when an auth token is successfully acquired from the server and rejects otherwise
  */
  async authenticate(credentials, headers) {
    const response = await this.makeRequest(
      this.serverTokenEndpoint,
      credentials,
      {
        ...this.headers,
        ...headers,
      },
    );
    return response.json;
  }

  /**
    Does nothing

    @method invalidate
    @return {Promise} Resolving promise
  */
  invalidate() {
    return resolve();
  }

  /**
    @method makeRequest
    @param {String} url Server endpoint
    @param {Object} data Object that will be sent to server
    @param {Object} headers Additional headers that will be sent to server
    @return {Promise} Promise that resolves when the request is successfully and rejects otherwise
  */
  async makeRequest(url, data, headers) {
    return fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(data),
    }).then((response) => {
      const res = {
        statusText: response.statusText,
        status: response.status,
        headers: response.headers,
      };

      return response
        .text()
        .then((text) => {
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
        })
        .catch(() => {
          return reject(res);
        });
    });
  }
}
