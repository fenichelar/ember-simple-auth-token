import { test } from 'ember-qunit';
import startApp from './../helpers/start-app';
import Ember from 'ember';
import Configuration from 'ember-simple-auth-token/configuration';

var App;

module('Configuration', {
  setup: () => {
    App = startApp();
  },
  teardown: () => {
    Ember.run(App, App.destroy);
  }
});

test('serverTokenEndpoint', assert => {
  assert.equal(Configuration.serverTokenEndpoint, '/api/token-auth/', 'defaults to "/api/token-auth/"');
});

test('identificationField', assert => {
  assert.equal(Configuration.identificationField, 'username', 'defaults to "username"');
});

test('tokenPropertyName', assert => {
  assert.equal(Configuration.tokenPropertyName, 'token', 'defaults to "token"');
});

test('authorizationPrefix', assert => {
  assert.equal(Configuration.authorizationPrefix, 'Bearer ', 'defaults to "Bearer "');
});

test('authorizationHeaderName', assert => {
  assert.equal(Configuration.authorizationHeaderName, 'Authorization', 'defaults to "Authorization"');
});

test('serverTokenRefreshEndpoint', assert => {
  assert.equal(Configuration.serverTokenRefreshEndpoint, '/api/token-refresh/', 'defaults to "/api/token-refresh/"');
});

test('refreshAccessTokens', assert => {
  assert.equal(Configuration.refreshAccessTokens, true, 'defaults to true');
});

test('refreshLeeway', assert => {
  assert.equal(Configuration.refreshLeeway, 0, 'defaults to 0');
});

test('tokenExpireName', assert => {
  assert.equal(Configuration.tokenExpireName, 'exp', 'defaults to "exp"');
});

test('timeFactor', assert => {
  assert.equal(Configuration.timeFactor, 1, 'defaults to 1');
});
