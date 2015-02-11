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
    sinon.spy(Ember.run, 'later');
  },
  teardown: function() {
    Ember.run(App, App.destroy);
    App.xhr.restore();
    Ember.run.later.restore();
  }
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
    expiresAt = (new Date()).getTime() + 60000;

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
      // Check that the resolved data matches the init data.
      deepEqual(content, data);
    });
  });
});

test('#restore resolves when the data includes `token` and excludes `expiresAt`', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() + 60000;

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
      // Check that the resolved data matches the init data.
      deepEqual(content, data);
    });
  });
});

test('#restore rejects when `refreshAccessTokens` is false', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() + 60000;

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
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
    });
  });
});

test('#restore rejects when `token` is excluded.', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() + 60000;

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
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
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
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
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

  // TODO: find out of there is another way besides setting Ember.testing.
  Ember.testing = false;

  Ember.run(function(){
    App.authenticator.restore(data).then(function(content){
      // Check that Ember.run.later ran.
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall.args[1], App.authenticator.refreshAccessToken);
      deepEqual(spyCall.args[2], token);
    });
  });
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
      // Check that Ember.run.later ran.
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall, null);
    });
  });
});

test('#restore does not schedule a token refresh when `expiresAt` < now.', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  Ember.run(function(){
    App.authenticator.restore(data).then(function(){
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
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
      headers: {}
    });
    Ember.$.ajax.restore();
  });
});

test('#authenticate rejects with invalid credentials', function() {
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
    400,
    {
      'Content-Type': 'application/json'
    },
    '{"message":["Unable to login with provided credentials."]}'
  ]); 
 
  // TODO: find out of there is another way besides setting Ember.testing.
  Ember.testing = false;

  Ember.run(function(){
    App.authenticator.authenticate(credentials).then(null, function(){
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
    });
  });
});

test('#authenticate schedules a token refresh when `refreshAccessTokens` is true', function() {
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
 
  // TODO: find out of there is another way besides setting Ember.testing.
  Ember.testing = false;

  Ember.run(function(){
    App.authenticator.authenticate(credentials).then(function(content){
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall.args[1], App.authenticator.refreshAccessToken);
      deepEqual(spyCall.args[2], token);
    });
  });
});

test('#authenticate does not schedule a token refresh when `refreshAccessTokens` is false', function() {
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
 
  App.authenticator.refreshAccessTokens = false;

  // TODO: find out of there is another way besides setting Ember.testing.
  Ember.testing = false;

  Ember.run(function(){
    App.authenticator.authenticate(credentials).then(function(content){
      // Check that Ember.run.later ran.
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall, null);
    });
  });
});

test('#refreshAccessToken makes an AJAX request to the token endpoint.', function() {
  sinon.spy(Ember.$, 'ajax');

  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  App.authenticator.refreshAccessToken(token);

  Ember.run.next(function(){
    var args = Ember.$.ajax.getCall(0).args[0];
    delete args.beforeSend;
    deepEqual(args, {
      url: jwt.serverTokenRefreshEndpoint,
      type: 'POST',
      data: JSON.stringify({'token': token}),
      dataType: 'json',
      contentType: 'application/json',
      headers: {}
    });
    Ember.$.ajax.restore();
  });
});

test('#refreshAccessToken triggers the `sessionDataUpdated` event on successful request.', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  App.server.respondWith('POST', jwt.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]); 

  App.authenticator.refreshAccessToken(token);

  App.authenticator.one('sessionDataUpdated', function(data){
    ok(data.expiresAt, 'Verify expiresAt was added to response');
    ok(data.expiresAt > (new Date()).getTime(), 'Verify is greater than now');
    deepEqual(data.token, token);
  });
});
