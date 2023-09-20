import Mixin from '@ember/object/mixin';
import { getOwner } from '@ember/application';
import { inject } from '@ember/service';
import { get } from '@ember/object';
import { isEmpty } from '@ember/utils';

/**
  Authorizer Mixin that works with token-based authentication like JWT by sending the `token` properties from the session in the `Authorization` header.

  @class TokenAuthorizer
  @module @triptyk/ember-simple-auth-token/mixins/token-authorizer
  @extends Ember.Mixin
*/
export default Mixin.create({
  session: inject('session'),

  /**
    @method init
  */
  init() {
    this._super(...arguments);
    const owner = getOwner(this);
    const environment = owner ? owner.resolveRegistration('config:environment') || {} : {};
    const config = environment['ember-simple-auth-token'] || {};
    this.tokenPropertyName = config.tokenPropertyName || 'token';
    this.authorizationHeaderName = config.authorizationHeaderName || 'Authorization';
    this.authorizationPrefix = config.authorizationPrefix === '' ? '' : config.authorizationPrefix || 'Bearer ';
  },

  /**
    Authorizes an XHR request by sending the `token` properties from the session in the `Authorization` header:

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
  },

  /**
    Handles response from server.

    @method authorize
    @param {Number} status
  */
  handleResponse(status) {
    if (status === 401 && this.get('session.isAuthenticated')) {
      this.get('session').invalidate();
    }
    return this._super(...arguments);
  }
});
