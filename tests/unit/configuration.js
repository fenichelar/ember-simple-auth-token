import { test, moduleForComponent } from 'ember-qunit';
import startApp from './../helpers/start-app';
import Ember from 'ember';
import Configuration from 'ember-simple-auth-token/configuration';

var App;

module('Configuration', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, App.destroy);
  }
});

test('serverTokenEndpoint', function() {
  equal(Configuration.serverTokenEndpoint, '/api/token-auth/', 'defaults to "/api/token-auth/"');
});

test('identificationField', function() {
  equal(Configuration.identificationField, 'username', 'defaults to "username"');
});

test('tokenPropertyName', function() {
  equal(Configuration.tokenPropertyName, 'token', 'defaults to "token"');
});

test('authorizationPrefix', function() {
  equal(Configuration.authorizationPrefix, 'Bearer ', 'defaults to "Bearer "');
});

test('authorizationHeaderName', function() {
  equal(Configuration.authorizationHeaderName, 'Authorization', 'defaults to "Authorization"');
});

test('serverTokenRefreshEndpoint', function() {
  equal(Configuration.serverTokenRefreshEndpoint, '/api/token-refresh/', 'defaults to "/api/token-refresh/"');
});

test('refreshAccessTokens', function() {
  equal(Configuration.refreshAccessTokens, true, 'defaults to true');
});

test('refreshLeeway', function() {
  equal(Configuration.refreshLeeway, 0, 'defaults to 0');
});

test('tokenExpireName', function() {
  equal(Configuration.tokenExpireName, 'exp', 'defaults to "exp"');
});

test('timeFactor', function() {
  equal(Configuration.timeFactor, 1, 'defaults to 1');
});
