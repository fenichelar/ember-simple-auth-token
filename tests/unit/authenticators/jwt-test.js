import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import JWT from 'ember-simple-auth-token/authenticators/jwt';
import Configuration from 'ember-simple-auth-token/configuration';

var App;

var createFakeToken = function(obj) {
  var token = window.btoa(JSON.stringify(obj));
  return 'a.' + token + '.b';
};

var getConvertedTime = function(time) {
  return time * 1000;
};

module('JWT Authenticator', {
  beforeEach() {
    App = startApp();
    App.xhr = sinon.useFakeXMLHttpRequest();
    App.server = sinon.fakeServer.create();
    App.server.autoRespond = true;
    App.authenticator = JWT.create();
    sinon.spy(Ember.run, 'cancel');
    sinon.stub(Ember.run, 'later', function(scope, callback, args, wait) {
      callback.call(scope, args);
    });
    sinon.spy(Ember.$, 'ajax');

  },
  afterEach() {
    Ember.run(App, App.destroy);
    Ember.$.ajax.restore();

    App.xhr.restore();
    Ember.run.cancel.restore();
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
  expect(1);
  var jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  sinon.stub(App.authenticator, 'getCurrentTime', function() { return currentTime; });

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.server.respondWith('POST', '/api/token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]);

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
  var jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  sinon.stub(App.authenticator, 'getCurrentTime', function() { return currentTime; });

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.server.respondWith('POST', '/api/token-refresh/', [
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
  var jwt = JWT.create(),
    expiresAt = 0;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  App.server.respondWith('POST', '/api/token-refresh/', [
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
  var jwt = JWT.create(),
    expiresAt = 3;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenExpireName] = expiresAt;


  App.server.respondWith('POST', '/api/token-refresh/', [
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
  var jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  sinon.stub(App.authenticator, 'getCurrentTime', function() { return currentTime; });

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  App.server.respondWith('POST', '/api/token-refresh/', [
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
  var jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  sinon.stub(App.authenticator, 'getCurrentTime', function() { return currentTime; });
  sinon.stub(App.authenticator, 'refreshAccessToken', function() { return null; });

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  var refreshedToken = {};
  refreshedToken[jwt.identificationField] = 'test@test.com';
  refreshedToken[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(refreshedToken);

  App.server.respondWith('POST', '/api/token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '" }'
  ]);

  Ember.run(function() {
    App.authenticator.restore(data).then(function(content) {
      // Check that Ember.run.later ran.
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall.args[1], App.authenticator.refreshAccessToken);
      deepEqual(spyCall.args[2], token);

      App.authenticator.refreshAccessToken.restore();
    });
  });
});


test('#restore does not schedule a token refresh when `refreshAccessTokens` is false.', function() {
  expect(1);
  var jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  sinon.stub(App.authenticator, 'getCurrentTime', function() { return currentTime; });

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

test('#restore does not schedule a token refresh when `expiresAt` <= `now`.', function() {
  expect(1);
  var jwt = JWT.create(),
    expiresAt = -1;

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

test('#restore does not schedule a token refresh when `expiresAt` - `refreshLeeway` < `now`.', function() {
  expect(1);
  var jwt = JWT.create(),
    expiresAt = getConvertedTime(6000);

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

test('#restore schedule access token refresh and refreshes it when time is appropriate', function() {
  expect(1);
  var jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  let refreshAccessToken;
  let refreshAccessTokenTarget;
  let refreshAccessTokenArgs;

  Ember.run.later.restore();
  sinon.stub(Ember.run, 'later', function(target, method, args, wait) {
    refreshAccessToken = method;
    refreshAccessTokenTarget = target;
    refreshAccessTokenArgs = args;

    return Math.random();
  });

  sinon.stub(App.authenticator, 'getCurrentTime', function() { return currentTime; });

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
      // Check that Ember.run.cancel was called.
      deepEqual(Ember.run.cancel.getCall(1), true);
    });
  });

  currentTime = getConvertedTime(1250);
  App.authenticator.getCurrentTime.restore();
  sinon.stub(App.authenticator, 'getCurrentTime', function() { return currentTime; });

  var refreshedToken = {};
  refreshedToken[jwt.identificationField] = 'test@test.com';
  refreshedToken[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(refreshedToken);

  App.server.respondWith('POST', '/api/token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '" }'
  ]);

  Ember.run(function() {
    refreshAccessToken.call(refreshAccessTokenTarget, refreshAccessTokenArgs).then(function(response) {
      deepEqual(response, { exp: expiresAt, token: token });
    });
  });
});

test('#authenticate sends an ajax request to the token endpoint', function() {
  expect(1);

  var jwt = JWT.create();

  var credentials = {
    identification: 'username',
    password: 'password'
  };

  App.authenticator.authenticate(credentials);

  Ember.run(function() {
    var args = Ember.$.ajax.getCall(0).args[0];
    delete args.beforeSend;
    deepEqual(args, {
      url: jwt.serverTokenEndpoint,
      method: 'POST',
      data: '{"password":"password","username":"username"}',
      dataType: 'json',
      contentType: 'application/json',
      headers: {}
    });
  });
});

test('#authenticate rejects with invalid credentials', function() {
  expect(1);
  var jwt = JWT.create();

  var credentials = {
    identification: 'username',
    password: 'password'
  };

  App.server.respondWith('POST', jwt.serverTokenEndpoint, [
    400, {
      'Content-Type': 'application/json'
    },
    '{"message":["Unable to login with provided credentials."]}'
  ]);

  Ember.run(function() {
    App.authenticator.authenticate(credentials).then(null, function() {
      // Check that Ember.run.later was not called.
      deepEqual(Ember.run.later.getCall(0), null);
    });
  });
});

test('#authenticate schedules a token refresh when `refreshAccessTokens` is true', function() {
  var jwt = JWT.create(),
    expiresAt = new Date().getTime() + 300000;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var credentials = {
    identification: 'username',
    password: 'password'
  };

  App.server.respondWith('POST', jwt.serverTokenEndpoint, [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]);

  Ember.run(function() {
    App.authenticator.authenticate(credentials).then(function(content) {
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall.args[1], App.authenticator.refreshAccessToken);
      deepEqual(spyCall.args[2], token);
    });
  });
});

test('#authenticate does not schedule a token refresh when `refreshAccessTokens` is false', function() {
  var jwt = JWT.create(),
    expiresAt = 3;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  var credentials = {
    identification: 'username',
    password: 'password'
  };

  App.server.respondWith('POST', jwt.serverTokenEndpoint, [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '"}'
  ]);

  App.authenticator.refreshAccessTokens = false;

  Ember.run(function() {
    App.authenticator.authenticate(credentials).then(function(content) {
      // Check that Ember.run.later ran.
      var spyCall = Ember.run.later.getCall(0);
      deepEqual(spyCall, null);
    });
  });
});

test('#refreshAccessToken makes an AJAX request to the token endpoint.', function() {
  var jwt = JWT.create(),
    expiresAt = 3;

  var token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  App.authenticator.refreshAccessToken(token);

  Ember.run(function() {
    var args = Ember.$.ajax.getCall(0).args[0];
    delete args.beforeSend;
    deepEqual(args, {
      url: jwt.serverTokenRefreshEndpoint,
      method: 'POST',
      data: JSON.stringify({
        'token': token
      }),
      dataType: 'json',
      contentType: 'application/json',
      headers: {}
    });
  });
});

test('#refreshAccessToken triggers the `sessionDataUpdated` event on successful request.', function() {
  var jwt = JWT.create(),
    expiresAt = 3;

  sinon.stub(App.authenticator, 'scheduleAccessTokenRefresh', function() { return null; });

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
    ok(data[jwt.tokenExpireName] > 0, 'Verify is greater than `now`');
    deepEqual(data.token, token);
    App.authenticator.scheduleAccessTokenRefresh.restore();
  });
});

test('#getTokenData returns correct data', function() {
  var jwt = JWT.create();

  var stringTokenData = 'test@test.com';
  var objectTokenData = {};

  objectTokenData[jwt.identificationField] = stringTokenData;

  var objectToken = createFakeToken(objectTokenData);
  var stringToken = createFakeToken(stringTokenData);

  deepEqual(jwt.getTokenData(objectToken), objectTokenData, 'Object data returned');
  equal(jwt.getTokenData(stringToken), stringTokenData, 'String data returned');
});
