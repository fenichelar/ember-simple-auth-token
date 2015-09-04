import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import Token from 'simple-auth-token/authorizers/token';
import Session from 'ember-simple-auth/internal-session';
import EphemeralStore from 'ember-simple-auth/session-stores/ephemeral';

var App,
    requestHeaderName,
    requestHeaderValue,
    setRequestHeader = false,
    data = { token: 'secret token!' };

module('Token Authenticator', {
  setup: function() {
    App = startApp();
    App.authorizer = Token.create({
      session: Session.create({
        store: EphemeralStore.create()
      })
    });
  },
  teardown: function() {
    Ember.run(App, App.destroy);
  }
});

test('#authorize when authenticated adds token to request', function() {
  expect(2);

  App.authorizer.set('session.isAuthenticated', true);

  App.authorizer.authorize(data, (headerName, headerValue) => {
    equal(headerName, 'Authorization');
    equal(headerValue, 'Bearer secret token!');
  });
});

test('#authorize when session does not contain token', function() {
  expect(0);

  App.authorizer.set('session.secure', {
    user_token: null
  });

  App.authorizer.authorize(data, () => {
    equal(1, 1, "Should not be called.");
  });
});

test('#authorize when session is not authenticated', function() {
  expect(0);

  App.authorizer.set('session.isAuthenticated', false);

  App.authorizer.authorize(data, () => {
    equal(1, 1, "Should not be called.");
  });
});
