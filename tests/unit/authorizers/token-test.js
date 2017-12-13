import { module } from 'qunit';
import { test } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import Token from 'ember-simple-auth-token/authorizers/token';
import Session from 'ember-simple-auth/internal-session';
import EphemeralStore from 'ember-simple-auth/session-stores/ephemeral';

var App, data;

module('Token Authenticator', {
  beforeEach: () => {
    data = { token: 'secret token!' };
    App = startApp();
    App.authorizer = Token.create({
      session: Session.create({
        store: EphemeralStore.create()
      })
    });
  },
  afterEach: () => {
    Ember.run(App, App.destroy);
  }
});

test('#authorize when authenticated adds token to request', assert => {
  assert.expect(2);

  App.authorizer.set('session.isAuthenticated', true);

  App.authorizer.authorize(data, (headerName, headerValue) => {
    assert.equal(headerName, 'Authorization');
    assert.equal(headerValue, 'Bearer secret token!');
  });
});

test('#authorize when authenticated adds token to request, nested tokenPropertyName', assert => {
  assert.expect(2);

  App.authorizer.set('session.isAuthenticated', true);

  data = {nested: {token: 'secret nested token!'}};
  App.authorizer.tokenPropertyName = 'nested.token';

  App.authorizer.authorize(data, (headerName, headerValue) => {
    assert.equal(headerName, 'Authorization');
    assert.equal(headerValue, 'Bearer secret nested token!');
  });
});

test('#authorize when session does not contain token', assert => {
  assert.expect(0);

  App.authorizer.set('session.secure', {
    user_token: null
  });

  App.authorizer.authorize(data, () => {
    assert.equal(1, 1, 'Should not be called.');
  });
});

test('#authorize when session is not authenticated', assert => {
  assert.expect(0);

  App.authorizer.set('session.isAuthenticated', false);

  App.authorizer.authorize(data, () => {
    assert.equal(1, 1, 'Should not be called.');
  });
});
