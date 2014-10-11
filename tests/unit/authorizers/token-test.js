import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import Token from 'simple-auth-token/authorizers/token';
import Session from 'simple-auth/session';
import EphemeralStore from 'simple-auth/stores/ephemeral';

var App,
    requestHeaderName,
    requestHeaderValue,
    setRequestHeader = false;

module('Token Authenticator', {
  setup: function() {
    App = startApp();
    App.authorizer = Token.create();
    App.request = {
      setRequestHeader: function(name, value) {
        setRequestHeader = true;
        requestHeaderName = name;
        requestHeaderValue = value;
      }
    };

    var session = Session.create();
    session.setProperties({
      store: EphemeralStore.create()
    });

    App.authorizer.set('session', session);

    sinon.spy(App.request, 'setRequestHeader');
  },
  teardown: function() {
    Ember.run(App, App.destroy);
  }
});

test('#authorize when authenticated adds token to request', function() {
  expect(3);

  App.authorizer.set('session.isAuthenticated', true);
  App.authorizer.set('session.token', 'secret token!');
  App.authorizer.authorize(App.request, {});

  ok(setRequestHeader);
  equal(requestHeaderName, 'Authorization');
  equal(requestHeaderValue, 'Bearer secret token!');

  setRequestHeader = false;
  requestHeaderName = undefined;
  requestHeaderValue = undefined;
});

test('#authorize when session does not contain token', function() {
  App.authorizer.set('session.user_token', null);
  App.authorizer.authorize(App.request, {});

  ok(!setRequestHeader);
});

test('#authorize when session is not authenticated', function() {
  App.authorizer.set('session.isAuthenticated', false);
  App.authorizer.authorize(App.request, {});

  ok(!setRequestHeader);
});
