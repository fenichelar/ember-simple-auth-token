import { test, moduleForComponent } from 'ember-qunit';
import startApp from './../helpers/start-app';
import Ember from 'ember';
import Configuration from 'simple-auth-token/configuration';

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
  equal(Configuration.serverTokenEndpoint, '/api-token-auth/', 'defaults to "/api-token-auth/"');
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

test('enableHttpsWarnings', function() {
  equal(Configuration.enableHttpsWarnings, false, 'defaults to "false"');
});
