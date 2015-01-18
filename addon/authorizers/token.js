import Ember from 'ember';
import Base from 'simple-auth/authorizers/base';
import Configuration from '../configuration';

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

    This value can be configured via
    [`SimpleAuth.Configuration.Token#authorizationPrefix`](#SimpleAuth-Configuration-Token-authorizationPrefix).

    @property authorizationPrefix
    @type String
    @default 'Bearer '
  */
  authorizationPrefix: 'Bearer ',

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
    The name of the HTTP Header used to send token.

    This value can be configured via
    [`SimpleAuth.Configuration.Token#authorizationHeaderName`](#SimpleAuth-Configuration-Token-authorizationHeaderName).

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
    this.tokenPropertyName = Configuration.tokenPropertyName;
    this.authorizationHeaderName = Configuration.authorizationHeaderName;

    if (Configuration.authorizationPrefix || Configuration.authorizationPrefix === null) {
      this.authorizationPrefix = Configuration.authorizationPrefix;
    }
  },

  /**
    Authorizes an XHR request by sending the `token`
    properties from the session in the `Authorization` header:

    ```
    Authorization: Bearer <token>
    ```

    @method authorize
    @param {jqXHR} jqXHR The XHR request to authorize (see http://api.jquery.com/jQuery.ajax/#jqXHR)
  */
  authorize: function(jqXHR) {
    var token = this.buildToken();

    if (this.get('session.isAuthenticated') && !Ember.isEmpty(token)) {
      if(this.authorizationPrefix) {
        token = this.authorizationPrefix + token;
      }

      jqXHR.setRequestHeader(this.authorizationHeaderName, token);
    }
  },

  /**
    Builds the token string. It can be overriden for inclusion of quotes.

    @method buildToken
    @return {String}
  */
  buildToken: function() {
    return this.get('session.' + this.tokenPropertyName);
  }
});
