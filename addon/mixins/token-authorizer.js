import Ember from 'ember';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import Configuration from '../configuration';

/**
  Authorizer Mixin that works with token-based authentication like JWT
  by sending the `token` properties from the session in the `Authorization` header.

  @class TokenAuthorizer
  @module ember-simple-auth-token/mixins/token-authorizer
  @extends Ember.Mixin
*/
export default Ember.Mixin.create(DataAdapterMixin, {
  session: Ember.inject.service('session'),

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
  init() {
    this._super(...arguments);
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
    @param {XMLHttpRequest} xhr
  */
  authorize(xhr) {
    const data = Ember.get(this, 'session.data.authenticated');
    const token = Ember.get(data, this.tokenPropertyName);
    const prefix = this.authorizationPrefix ? this.authorizationPrefix : '';

    if (this.get('session.isAuthenticated') && !Ember.isEmpty(token)) {
      xhr.setRequestHeader(this.authorizationHeaderName, prefix + token);
    }
  }
});
