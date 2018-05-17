import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { getOwner } from '@ember/application';

export default Controller.extend({
  session: inject('session'),

  sessionData: computed('session.session.content.authenticated', function() {
    return JSON.stringify(this.get('session.session.content.authenticated'), null, '\t');
  }),

  tokenData: computed('session.session.content.authenticated', function() {
    var authenticator = getOwner(this).lookup('authenticator:jwt'),
        session = this.get('session.session.content.authenticated'),
        tokenData = {};

    if(session && Object.keys(session).length > 0) {
      tokenData = authenticator.getTokenData(session.token);
    }

    return JSON.stringify(tokenData, null, '\t');
  })
});
