import loadConfig from './utils/load-config';

var defaults = {
  serverTokenEndpoint: '/api-token-auth/',
  identificationField: 'username',
  tokenPropertyName: 'token',
  authorizationPrefix: 'Bearer ',
  authorizationHeaderName: 'Authorization',
  enableHttpsWarnings: false
};

/**
  Ember Simple Auth Token's configuration object.

  To change any of these values, define a global environment object for Ember
  Simple Auth and define the values there:

  ```js
  window.ENV = window.ENV || {};
  window.ENV['simple-auth-token'] = {
    serverTokenEndpoint: '/some/other/endpoint'
  }
  ```

  @class Token
  @namespace SimpleAuth.Configuration
  @module simple-auth/configuration
*/
export default {
  /**
    The endpoint on the server the authenticator acquires the auth token
    and email from.

    @property serverTokenEndpoint
    @readOnly
    @static
    @type String
    @default '/users/sign_in'
  */
  serverTokenEndpoint: defaults.serverTokenEndpoint,

  /**
    The attribute-name that is used for the identification field when sending
    the authentication data to the server.

    @property identificationField
    @readOnly
    @static
    @type String
    @default 'username'
  */
  identificationField: defaults.identificationField,

  /**
    The name of the property in session that contains token
    used for authorization.

    @property tokenPropertyName
    @readOnly
    @static
    @type String
    @default 'token'
  */
  tokenPropertyName: defaults.tokenPropertyName,

  /**
    The prefix used in the value of the Authorization header.

    @property authorizationPrefix
    @readOnly
    @static
    @type String
    @default 'Bearer '
  */
  authorizationPrefix: defaults.authorizationPrefix,

  /**
    The name of the HTTP Header used to send token.

    @property authorizationHeaderName
    @readOnly
    @static
    @type String
    @default 'Authorization'
  */
  authorizationHeaderName: defaults.authorizationHeaderName,

  /**
    Enables https warnings in console

    @property enableHttpsWarnings
    @readOnly
    @static
    @type Boolean
    @default 'false'
  */
  enableHttpsWarnings: defaults.enableHttpsWarnings,

  /**
    @method load
    @private
  */
  load: loadConfig(defaults)
};
