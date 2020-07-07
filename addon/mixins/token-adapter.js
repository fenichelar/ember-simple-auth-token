import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import { get, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import config from 'ember-get-config';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

/**
  Adapter Mixin that works with token-based authentication like JWT.

  @class TokenAdapter
  @module ember-simple-auth-token/mixins/token-adapter
  @extends Ember.Mixin
*/
export default Mixin.create(DataAdapterMixin, {
  session: inject('session'),

  /**
    @method init
  */
  init() {
    this._super(...arguments);
    const conf = config['ember-simple-auth-token'] || {};
    this.tokenPropertyName = conf.tokenPropertyName || 'token';
    this.authorizationHeaderName = conf.authorizationHeaderName || 'Authorization';
    this.authorizationPrefix = conf.authorizationPrefix === '' ? '' : conf.authorizationPrefix || 'Bearer ';
  },

  /*
    Adds the `token` property from the session to the `authorizationHeaderName`:
  */
  headers: computed('session.data.authenticated', function() {
    const data = this.get('session.data.authenticated');
    const token = get(data, this.get('tokenPropertyName'));
    const prefix = this.get('authorizationPrefix');
    const header = this.get('authorizationHeaderName');

    if (this.get('session.isAuthenticated') && !isEmpty(token)) {
      return {
        [header]: `${prefix}${token}`
      };
    } else {
      return {};
    }
  })
});
