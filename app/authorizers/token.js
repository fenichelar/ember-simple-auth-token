import Ember from 'ember';
import Base from 'simple-auth/authorizers/base';
import getGlobalConfig from './../utils/get-global-config';
import isSecureUrl from './../utils/is-secure-url';

/**
  Authorizer that works with token-based authentication like JWT
  by sending the `token` properties from the session in the `Authorization` header.

  _The factory for this authorizer is registered as
  `'simple-auth-authorizer:token'` in Ember's container._

  @class Token
  @namespace SimpleAuth.Authorizers
  @module simple-auth-token/authorizers/token
  @extends Base
*/
export default Base.extend({
  /**
    The prefix used in the value of the Authorization header.

    This value can be configured via the global environment object:

    ```js
    window.ENV = window.ENV || {};
    window.ENV['simple-auth-token'] = {
      authorizationPrefix: 'JWT '
    }
    ```

    @property authorizationPrefix
    @type String
    @default 'Bearer '
  */
  authorizationPrefix: 'Bearer ',

  /**
    The name of the property in session that contains token used for authorization.

    This value can be configured via the global environment object:

    ```js
    window.ENV = window.ENV || {};
    window.ENV['simple-auth-token'] = {
      tokenPropertyName: 'authToken'
    }
    ```

    @property tokenPropertyName
    @type String
    @default 'token'
  */
  tokenPropertyName: 'token',

  /**
    The name of the HTTP Header used to send token.

    This value can be configured via the global environment object:

    ```js
    window.ENV = window.ENV || {};
    window.ENV['simple-auth-token'] = {
      authorizationHeaderName: 'X-Auth'
    }
    ```

    @property authorizationHeaderName
    @type String
    @default 'Authorization'
  */
  authorizationHeaderName: 'Authorization',

  /**
    @method init
    @private
  */
  init: function() {
    var globalConfig = getGlobalConfig('simple-auth-token');
    this.authorizationPrefix = globalConfig.authorizationPrefix || this.authorizationPrefix;
    this.tokenPropertyName = globalConfig.tokenPropertyName || this.tokenPropertyName;
    this.authorizationHeaderName = globalConfig.authorizationHeaderName || this.authorizationHeaderName;
  },

  /**
    Authorizes an XHR request by sending the `token`
    properties from the session in the `Authorization` header:

    ```
    Authorization: Bearer <token>
    ```

    @method authorize
    @param {jqXHR} jqXHR The XHR request to authorize (see http://api.jquery.com/jQuery.ajax/#jqXHR)
    @param {Object} requestOptions The options as provided to the `$.ajax` method (see http://api.jquery.com/jQuery.ajaxPrefilter/)
  */

  authorize: function(jqXHR, requestOptions) {
    var token = this.get('session.' + this.tokenPropertyName);

    if (this.get('session.isAuthenticated') && !Ember.isEmpty(token)) {
      if (!isSecureUrl(requestOptions.url)) {
        Ember.Logger.warn('Credentials are transmitted via an insecure connection - use HTTPS to keep them secure.');
      }

      jqXHR.setRequestHeader(this.headerName, this.authorizationPrefix + token);
    }
  }
});
