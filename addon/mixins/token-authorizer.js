import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import config from 'ember-get-config';

/**
  Authorizer Mixin that works with token-based authentication like JWT
  by sending the `token` properties from the session in the `Authorization` header.

  @class TokenAuthorizer
  @module ember-simple-auth-token/mixins/token-authorizer
  @extends Ember.Mixin
*/
export default Mixin.create(DataAdapterMixin, {
  session: inject('session'),

  /**
    @method init
    @private
  */
  init() {
    this._super(...arguments);
    const conf = config['ember-simple-auth-token'] || {};
    this.tokenPropertyName = conf.tokenPropertyName || 'token';
    this.authorizationHeaderName = conf.authorizationHeaderName || 'Authorization';
    this.authorizationPrefix = conf.authorizationPrefix === '' ? '' : conf.authorizationPrefix || 'Bearer ';
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
    const data = get(this, 'session.data.authenticated');
    const token = get(data, this.get('tokenPropertyName'));
    const prefix = this.get('authorizationPrefix');
    const header = this.get('authorizationHeaderName');

    if (this.get('session.isAuthenticated') && !isEmpty(token)) {
      xhr.setRequestHeader(header, prefix + token);
    }
  }
});
