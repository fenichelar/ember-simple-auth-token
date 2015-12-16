import loadConfig from './utils/load-config';

var defaults = {
  serverTokenEndpoint: '/api/token-auth/',
  serverTokenRefreshEndpoint: '/api/token-refresh/',
  identificationField: 'username',
  passwordField: 'password',
  tokenPropertyName: 'token',
  refreshAccessTokens: true,
  refreshLeeway: 0,
  tokenExpireName: 'exp',
  authorizationPrefix: 'Bearer ',
  authorizationHeaderName: 'Authorization',
  timeFactor: 1,
  headers: {}
};

/**
  Ember Simple Auth Token's configuration object.

  To change any of these values, set them on the application's
  environment object:

  ```js
  ENV['ember-simple-auth-token'] = {
    serverTokenEndpoint: '/some/other/endpoint'
  }
  ```

  @class Token
  @namespace SimpleAuth.Configuration
  @module ember-simple-auth/configuration
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
    @default '/api/token-refresh/'
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
    The attribute-name that is used for the password field when sending
    the authentication data to the server.

    @property passwordField
    @readOnly
    @static
    @type String
    @default 'password'
  */
  passwordField: defaults.passwordField,

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
    The number of seconds to subtract from the token's time of expiration when
    scheduling the automatic token refresh call.
    @property refreshLeeway
    @type Integer
    @default 0 (seconds)
  */
  refreshLeeway: defaults.refreshLeeway,

  /**
    The name for which decoded token field represents the token expire time.
    @property tokenExpireName
    @type String
    @default 'exp'
  */
  tokenExpireName: defaults.tokenExpireName,

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
    Custom headers to be added on request.

    @property headers
    @readonly
    @static
    @type Object
    @default {}
  */
  headers: defaults.headers,

  /**
    @method load
    @private
  */
  load: loadConfig(defaults)
};
