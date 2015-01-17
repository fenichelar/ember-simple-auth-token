import loadConfig from './utils/load-config';

var defaults = {
  serverTokenEndpoint: '/api-token-auth/',
  serverTokenRefreshEndpoint: '/api-token-refresh/',
  identificationField: 'username',
  tokenPropertyName: 'token',
  refreshAccessTokens: true,
  tokenExpireName: 'exp',
  tokenOrigIssuedAt: 'orig_iat',
  authorizationPrefix: 'Bearer ',
  authorizationHeaderName: 'Authorization',
  timeFactor: 1,
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
    The endpoint on the server where the authenticator refreshes a token.
    @property serverTokenRefreshEndpoint
    @type String
    @default '/api-token-refresh/'
  */
  serverTokenRefreshEndpoint: defaults.serverTokenRefreshEndpoint,


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
    Sets whether the authenticator automatically refreshes access tokens.
    @property refreshAccessTokens
    @type Boolean
    @default true
  */
  refreshAccessTokens: defaults.refreshAccessTokens,

  /**
    The name for which decoded token field represents the token expire time.
    @property tokenExpireName
    @type String
    @default 'exp' 
  */
  tokenExpireName: defaults.tokenExpireName,

  /**
    The name for which decoded token field represents the token issed at time.
    @property tokenOrigIssuedAt
    @type String
    @default 'orig_iat' 
  */
  tokenOrigIssuedAt: defaults.tokenOrigIssuedAt,

  /**
    Default time unit.
    @property timeFactor
    @type Integer
    @default 1 (seconds)
  */
  timeFactor: 1,

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
    @method load
    @private
  */
  load: loadConfig(defaults)
};
