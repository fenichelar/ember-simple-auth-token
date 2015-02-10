import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import JWT from 'simple-auth-token/authenticators/jwt';
import Configuration from 'simple-auth-token/configuration';
import QUnit from 'qunit';

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

QUnit.testStart(function(detail){
  sinon.spy(Ember.run, 'later');
});

QUnit.testDone(function(detail){
  Ember.run.later.restore();
});

test('assigns serverTokenRefreshEndpoint from the configuration object', function() {
  Configuration.serverTokenRefreshEndpoint = 'serverTokenRefreshEndpoint';

  equal(JWT.create().serverTokenRefreshEndpoint, 'serverTokenRefreshEndpoint');

  Configuration.load({}, {});
});

test('assigns refreshAccessTokens from the configuration object', function() {
  Configuration.refreshAccessTokens = 'refreshAccessTokens';

  equal(JWT.create().refreshAccessTokens, 'refreshAccessTokens');

  Configuration.load({}, {});
});

test('assigns tokenExpireName from the configuration object', function() {
  Configuration.tokenExpireName = 'tokenExpireName';

  equal(JWT.create().tokenExpireName, 'tokenExpireName');

  Configuration.load({}, {});
});

test('assigns timeFactor from the configuration object', function() {
  Configuration.timeFactor = 'timeFactor';

  equal(JWT.create().timeFactor, 'timeFactor');

  Configuration.load({}, {});
});

test('#restore resolves when the data includes `token` and `expiresAt`', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() - 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.server.respondWith('POST', '/api-token-refresh/', [
    201,
    {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]); 

  Ember.run(function(){
    App.authenticator.restore(data).then(function(content){
      deepEqual(content, data);
    });
  });
});

test('#restore resolves when the data includes `token` and excludes `expiresAt`', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() - 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var data = {};
  data[jwt.tokenPropertyName] = token;

  App.server.respondWith('POST', '/api-token-refresh/', [
    201,
    {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]); 
 
  Ember.run(function(){
    App.authenticator.restore(data).then(function(content){
      deepEqual(content, data);
    });
  });
});

test('#restore rejects when `refreshAccessTokens` is false', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() - 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data['expiresAt'] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  App.server.respondWith('POST', '/api-token-refresh/', [
    201,
    {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]); 
 
  Ember.run(function(){
    App.authenticator.restore(data).then(null, function(){
      ok(true, 'If we are there then the promise was rejected.');
    });
  });
});

test('#restore rejects when `token` is excluded.', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() - 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var data = {};
  data['expiresAt'] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  App.server.respondWith('POST', '/api-token-refresh/', [
    201,
    {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]); 
 
  Ember.run(function(){
    App.authenticator.restore(data).then(null, function(){
      ok(true, 'If we are there then the promise was rejected.');
    });
  });
});

test('#restore resolves when `expiresAt` is greater than `now`', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  App.server.respondWith('POST', '/api-token-refresh/', [
    201,
    {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]); 
 
  Ember.run(function(){
    App.authenticator.restore(data).then(function(content){
      deepEqual(content, data);
    });
  });
});

test('#restore schedules a token refresh when `refreshAccessTokens` is true.', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  // This is bad - waiting for better solution, required to check Ember.run.later.
  Ember.testing = false;

  Ember.run(function(){
    App.authenticator.restore(data).then(function(content){
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall.args[1], App.authenticator.refreshAccessToken);
      deepEqual(spyCall.args[2], data.token);
    });
  });

  Ember.testing = true;
});

test('#restore does not schedule a token refresh when `refreshAccessTokens` is false.', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  Ember.run(function(){
    App.authenticator.restore(data).then(function(content){
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall, null);
    });
  });
});

test('#authenticate sends an ajax request to the token endpoint', function() {
  sinon.spy(Ember.$, 'ajax');

  var jwt = JWT.create();

  var credentials = {
    identification: 'username',
    password: 'password'
  };

  App.authenticator.authenticate(credentials);

  Ember.run.next(function() {
    var args = Ember.$.ajax.getCall(0).args[0];
    delete args.beforeSend;
    deepEqual(args, {
      url: jwt.serverTokenEndpoint,
      type: 'POST',
      data: '{"password":"password","username":"username"}',
      dataType: 'json',
      contentType: 'application/json',
    });

    Ember.$.ajax.restore();
  });
});

test('#authenticate schedules a token refresh', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var credentials = {
    identification: 'username',
    password: 'password'
  };

  App.server.respondWith('POST', jwt.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]); 
 
  // This is bad - waiting for better solution, required to check Ember.run.later.
  Ember.testing = false;

  Ember.run(function(){
    App.authenticator.authenticate(credentials).then(function(content){
      var spyCall = Ember.run.later.getCall(0);
 
      deepEqual(spyCall.args[1], App.authenticator.refreshAccessToken);
    });
  });

  Ember.testing = false;
});

