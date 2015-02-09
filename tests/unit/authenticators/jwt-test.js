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

test('#restore resolves correctly with good data', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() - 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var goodData = {};
  goodData[jwt.tokenPropertyName] = token;
  goodData[jwt.tokenExpireName] = expiresAt;

  App.server.respondWith('POST', '/api-token-refresh/', [
    201,
    {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]); 

  Ember.run(function(){
    App.authenticator.restore(goodData).then(function(content){
      deepEqual(content, goodData);
    });
  });
});

test('#restore resolves correctly with bad data', function() {
  var jwt = JWT.create(),
    expiresAt = (new Date()).getTime() - 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;
  
  token = window.btoa(JSON.stringify(token));

  var badData = {};
  badData[jwt.tokenPropertyName] = token;

  App.server.respondWith('POST', '/api-token-refresh/', [
    201,
    {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]); 
 
  Ember.run(function(){
    App.authenticator.restore(badData).then(function(content){
      deepEqual(content, badData);
    });
  });
});


/*
test('#authenticate sends an AJAX request to the sign in endpoint', function() {
  sinon.spy(Ember.$, 'ajax');

  var credentials = {
    identification: 'username',
    password: 'password'
  };

  App.authenticator.authenticate(credentials);

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
*/
