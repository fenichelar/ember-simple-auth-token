import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import JWT from 'simple-auth-token/authenticators/jwt';
import Configuration from 'simple-auth-token/configuration';

var App;

module('JWT Authenticator', {
  setup: function() {
    App = startApp();
    App.xhr = sinon.useFakeXMLHttpRequest();
    App.server = sinon.fakeServer.create();
    App.server.autoRespond = true;
    App.authenticator = JWT.create();
  },
  teardown: function() {
    Ember.run(App, App.destroy);
    App.xhr.restore();
  }
});

test('assigns serverTokenRefreshEndpoint from the configuration object', function() {
  Configuration.serverTokenRefreshEndpoint = 'serverTokenRefreshEndpoint';

  equal(JWT.create().serverTokenRefreshEndpoint, 'serverTokenRefreshEndpoint');

  Configuration.load({}, {});
});

test('assigns refreshAccessTokens from the configuration object', function() {
  Configuration.refreshAccessTokens = 'refreshAccessTokens';

  equal(Token.create().refreshAccessTokens, 'refreshAccessTokens');

  Configuration.load({}, {});
});

test('assigns tokenExpireName from the configuration object', function() {
  Configuration.tokenExpireName = 'tokenExpireName';

  equal(Token.create().tokenExpireName, 'tokenExpireName');

  Configuration.load({}, {});
});

test('assigns timeFactor from the configuration object', function() {
  Configuration.timeFactor = 'timeFactor';

  equal(Token.create().timeFactor, 'timeFactor');

  Configuration.load({}, {});
});

test('#scheduleAccessTokenRefresh Takes a token and an expire time and schedules for automatic token refresh', function() {
  sinon.spy(Ember.run, 'later');

  var expiresAt = new Date().getTime(),
    token = 'access token';

  var credentials = {
    identification: 'username',
    password: 'password'
  };

  App.authenticator.authenticate(credentials);

  App.authenticator.scheduleAccessTokenRefresh(expiresAt, token);

  Ember.run.next(function() {
    var args = Ember.$.ajax.getCall(0).args[0];
    delete args.beforeSend;
    deepEqual(args, {
      url: '/api-token-auth/',
      type: 'POST',
      data: '{"password":"password","username":"username"}',
      dataType: 'json',
      contentType: 'application/json',
    });

    Ember.$.ajax.restore();
  });
});


test('#authenticate successfully resolves with the correct data', function() {
  sinon.spy(Ember.$, 'ajax');

  var credentials = {
    email: 'email@address.com',
    password: 'password'
  };

  App.server.respondWith('POST', '/api-token-auth/', [
    201,
    { 'Content-Type': 'application/json' },
    '{ "access_token": "secret token!" }'
  ]);

  Ember.run(function() {
    App.authenticator.authenticate(credentials).then(function(data) {
      deepEqual(data, {
        access_token: 'secret token!'
      });
    });

    Ember.$.ajax.restore();
  });
});

test('#authenticate rejects with the correct error', function() {
  sinon.spy(Ember.$, 'ajax');

  var credentials = {
    email: 'email@address.com',
    password: 'password'
  };

  App.server.respondWith('POST', '/api-token-auth/', [
    400,
    { 'Content-Type': 'application/json' },
    '{ "error": "invalid_grant" }'
  ]);

  Ember.run(function() {
    App.authenticator.authenticate(credentials).then(null, function(error) {
      deepEqual(error, {'error': 'invalid_grant'});
    });

    Ember.$.ajax.restore();
  });
});
