import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import JWTResolved from 'simple-auth-token/authenticators/jwt-resolved';
import Configuration from 'simple-auth-token/configuration';

var App;

var createFakeToken = function(obj) {
  var token = window.btoa(JSON.stringify(obj));
  return 'a.' + token + '.b';
};

module('JWT Resolved Authenticator', {
  setup: function() {
    App = startApp();
    App.xhr = sinon.useFakeXMLHttpRequest();
    App.server = sinon.fakeServer.create();
    App.server.autoRespond = true;
    App.authenticator = JWTResolved.create();
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

  equal(JWTResolved.create().serverTokenRefreshEndpoint, 'serverTokenRefreshEndpoint');

  Configuration.load({}, {});
});

test('assigns refreshAccessTokens from the configuration object', function() {
  Configuration.refreshAccessTokens = 'refreshAccessTokens';

  equal(JWTResolved.create().refreshAccessTokens, 'refreshAccessTokens');

  Configuration.load({}, {});
});

test('assigns tokenExpireName from the configuration object', function() {
  Configuration.tokenExpireName = 'tokenExpireName';

  equal(JWTResolved.create().tokenExpireName, 'tokenExpireName');

  Configuration.load({}, {});
});

test('assigns timeFactor from the configuration object', function() {
  Configuration.timeFactor = 'timeFactor';

  equal(JWTResolved.create().timeFactor, 'timeFactor');

  Configuration.load({}, {});
});

test('#restore resolves when the data includes `token` and `expiresAt`', function() {
  expect(1);
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data.expiresAt = expiresAt;

  Ember.run(function() {
    App.authenticator.restore(data).then(function(content) {
      // Check that the resolved data matches the init data.
      equal(JSON.stringify(content), JSON.stringify(data));
    }, function () {
      ok(false);
    });
  });
});

test('#restore resolves when the data includes `token` and excludes `expiresAt`', function() {
  expect(1);
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  App.server.respondWith('POST', '/api-token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]);

  Ember.run(function() {
    App.authenticator.restore(data).then(function(content) {
      equal(JSON.stringify(content), JSON.stringify(data), 'Check that the resolved data matches the init data');
    }).catch(function () {
      ok(false);
    });
  });
});

test('#restore rejects when `refreshAccessTokens` is false and token is expired', function() {
  expect(1);
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime();

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data['expiresAt'] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  App.server.respondWith('POST', '/api-token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]);

  Ember.run(function() {
    App.authenticator.restore(data).then(function () {
      ok(false);
    }, function() {
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
    });
  });
});

test('#restore rejects when `token` is excluded.', function() {
  expect(1);
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data['expiresAt'] = expiresAt;


  App.server.respondWith('POST', '/api-token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]);

  Ember.run(function() {
    App.authenticator.restore(data).then(function () {
      ok(false);
    }, function() {
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
    });
  });
});

test('#restore resolves when `expiresAt` is greater than `now`', function() {
  expect(1);
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  App.server.respondWith('POST', '/api-token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]);

  Ember.run(function() {
    App.authenticator.restore(data).then(function(content) {
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
    }).catch(function (err) {
      ok(false);
    });
  });
});

test('#restore schedules a token refresh when `refreshAccessTokens` is true.', function() {
  expect(2);
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  // TODO: find out if there is another way besides setting Ember.testing.
  Ember.testing = false;

  Ember.run(function() {
    App.authenticator.restore(data).then(function(content) {
      // Check that Ember.run.later ran.
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall.args[1], App.authenticator.refreshAccessToken);
      deepEqual(spyCall.args[2], token);
    });
  });
});

test('#restore does not schedule a token refresh when `refreshAccessTokens` is false.', function() {
  expect(1);
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  Ember.run(function() {
    App.authenticator.restore(data).then(function(content) {
      // Check that Ember.run.later ran.
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall, null);
    });
  });
});

test('#restore does not schedule a token refresh when `expiresAt` < now.', function() {
  expect(1);
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() - 10;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  Ember.run(function() {
    App.authenticator.restore(data).catch(function() {
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
    });
  });
});

test('#restore does not schedule a token refresh when `expiresAt` - `refreshLeeway` < now.', function() {
  expect(1);
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  // Set the refreshLeeway to > expiresAt.
  App.authenticator.refreshLeeway = 120;

  Ember.run(function() {
    App.authenticator.restore(data).catch(function() {
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
    });
  });
});

test('#authenticate schedules a token refresh when `refreshAccessTokens` is true', function() {
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);
  Ember.testing = false;
  Ember.run(function() {
    App.authenticator.authenticate(token).then(function(content) {
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall.args[1], App.authenticator.refreshAccessToken);
      deepEqual(spyCall.args[2], token);
    });
  });
});

test('#authenticate does not schedule a token refresh when `refreshAccessTokens` is false', function() {
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  App.authenticator.refreshAccessTokens = false;

  // TODO: find out of there is another way besides setting Ember.testing.
  Ember.testing = false;

  Ember.run(function() {
    App.authenticator.authenticate(token).then(function(content) {
      // Check that Ember.run.later ran.
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall, null);
    });
  });
});

test('#refreshAccessToken makes an AJAX request to the token endpoint.', function() {
  sinon.spy(Ember.$, 'ajax');

  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  App.authenticator.refreshAccessToken(token);

  Ember.run.next(function() {
    var args = Ember.$.ajax.getCall(0).args[0];
    delete args.beforeSend;
    deepEqual(args, {
      url: jwt.serverTokenRefreshEndpoint,
      type: 'POST',
      data: JSON.stringify({
        'token': token
      }),
      dataType: 'json',
      contentType: 'application/json',
      headers: {}
    });
    Ember.$.ajax.restore();
  });
});

test('#refreshAccessToken triggers the `sessionDataUpdated` event on successful request.', function() {
  var jwt = JWTResolved.create(),
    expiresAt = (new Date()).getTime() + 60000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  App.server.respondWith('POST', jwt.serverTokenRefreshEndpoint, [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]);

  App.authenticator.refreshAccessToken(token);

  App.authenticator.one('sessionDataUpdated', function(data) {
    ok(data[jwt.tokenExpireName], 'Verify expiresAt was added to response');
    ok(data[jwt.tokenExpireName] > (new Date()).getTime(), 'Verify is greater than now');
    deepEqual(data.token, token);
  });
});

test('#getTokenData returns correct data', function() {
  var jwt = JWTResolved.create();

  var stringTokenData = 'test@test.com';
  var objectTokenData = {};

  objectTokenData[jwt.identificationField] = stringTokenData;

  var objectToken = createFakeToken(objectTokenData);
  var stringToken = createFakeToken(stringTokenData);

  deepEqual(jwt.getTokenData(objectToken), objectTokenData, 'Object data returned');
  equal(jwt.getTokenData(stringToken), stringTokenData, 'String data returned');
});
