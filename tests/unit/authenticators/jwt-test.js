import { module } from 'qunit';
import { test } from 'ember-qunit';
import sinon from 'sinon';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import JWT from 'ember-simple-auth-token/authenticators/jwt';
import Configuration from 'ember-simple-auth-token/configuration';

var App;

const createFakeToken = obj => {
  var token = window.btoa(JSON.stringify(obj));
  return 'a.' + token + '.b';
};

const createFakeRefreshToken = () => {
  return window.btoa('91df47a8-8c7f-4411-98e7-43bfd32df5c4');
};

const getConvertedTime = time => {
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
    sinon.stub(Ember.run, 'later').callsFake((scope, callback, args) => {
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

test('assigns serverTokenRefreshEndpoint from the configuration object', assert => {
  Configuration.serverTokenRefreshEndpoint = 'serverTokenRefreshEndpoint';

  assert.equal(JWT.create().serverTokenRefreshEndpoint, 'serverTokenRefreshEndpoint');

  Configuration.load({}, {});
});

test('assigns refreshAccessTokens from the configuration object', assert => {
  Configuration.refreshAccessTokens = 'refreshAccessTokens';

  assert.equal(JWT.create().refreshAccessTokens, 'refreshAccessTokens');

  Configuration.load({}, {});
});

test('assigns tokenExpireName from the configuration object', assert => {
  Configuration.tokenExpireName = 'tokenExpireName';

  assert.equal(JWT.create().tokenExpireName, 'tokenExpireName');

  Configuration.load({}, {});
});

test('#restore resolves when the data includes `token` and `expiresAt`', assert => {
  assert.expect(1);

  const jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  sinon.stub(App.authenticator, 'getCurrentTime').callsFake(() => { return currentTime; });

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  const data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.server.respondWith('POST', '/api/token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  Ember.run(() => {
    App.authenticator.restore(data).then(content => {
      // Check that the resolved data matches the init data.
      assert.equal(JSON.stringify(content), JSON.stringify(data));
    }, () => {
      assert.ok(false);
    });
  });
});

test('#restore resolves when the data includes `token` and excludes `expiresAt`', assert => {
  assert.expect(1);

  const jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  sinon.stub(App.authenticator, 'getCurrentTime').callsFake(() => { return currentTime; });

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  const data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.server.respondWith('POST', '/api/token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  Ember.run(() => {
    App.authenticator.restore(data).then(content => {
      assert.equal(JSON.stringify(content), JSON.stringify(data), 'Check that the resolved data matches the init data');
    }).catch(() => {
      assert.ok(false);
    });
  });
});

test('#restore rejects when `refreshAccessTokens` is false and token is expired', assert => {
  assert.expect(1);
  const jwt = JWT.create(),
    expiresAt = 0;

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  const data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  App.server.respondWith('POST', '/api/token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  Ember.run(() => {
    App.authenticator.restore(data).then(() => {
      assert.ok(false);
    }, () => {
      // Check that refreshAccessToken was not scheduled
      assert.equal(Ember.run.later.getCalls().some((call) => {
        return call.args[1] === App.authenticator.refreshAccessToken;
      }), false);
    });
  });
});

test('#restore resolves when `expiresAt` is empty but the data includes a nested tokenPropertyName', assert => {
  assert.expect(1);

  const jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = null;

  sinon.stub(App.authenticator, 'getCurrentTime').callsFake(() => { return currentTime; });
  let authenticator = App.authenticator;
  authenticator.tokenPropertyName = 'auth.nested.token';

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  const data = {
    auth: {
      nested: {
        token: token
      }
    }
  };
  data[jwt.tokenExpireName] = expiresAt;

  Ember.run(() => {
    App.authenticator.restore(data).then(content => {
    // Check that the resolved data matches the init data.
      assert.equal(JSON.stringify(content), JSON.stringify(data));
    }, () => {
      assert.ok(false);
    });
  });
});

test('#restore rejects when `token` is excluded.', assert => {
  assert.expect(1);

  const jwt = JWT.create(),
    expiresAt = 3;

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  const data = {};
  data[jwt.tokenExpireName] = expiresAt;

  App.server.respondWith('POST', '/api/token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  Ember.run(() => {
    App.authenticator.restore(data).then(() => {
      assert.ok(false);
    }, () => {
      // Check that Ember.run.later was not called.
      assert.deepEqual(Ember.run.later.getCall(0), null);
    });
  });
});

test('#restore resolves when `expiresAt` is greater than `now`', assert => {
  assert.expect(1);

  const jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  sinon.stub(App.authenticator, 'getCurrentTime').callsFake(() => { return currentTime; });

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  const data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  App.server.respondWith('POST', '/api/token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  Ember.run(() => {
    App.authenticator.restore(data).then(() => {
      // Check that refreshAccessToken was not scheduled
      assert.equal(Ember.run.later.getCalls().some((call) => {
        return call.args[1] === App.authenticator.refreshAccessToken;
      }), false);
    }).catch(() => {
      assert.ok(false);
    });
  });
});

test('#restore schedules a token refresh when `refreshAccessTokens` is true.', assert => {
  assert.expect(1);

  const jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  sinon.stub(App.authenticator, 'getCurrentTime').callsFake(() => { return currentTime; });
  sinon.stub(App.authenticator, 'refreshAccessToken').callsFake(() => { return null; });

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  const data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.refreshTokenPropertyName] = refreshToken;
  data[jwt.tokenExpireName] = expiresAt;

  const refreshedToken = {};
  refreshedToken[jwt.identificationField] = 'test@test.com';
  refreshedToken[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(refreshedToken);

  App.server.respondWith('POST', '/api/token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  Ember.run(() => {
    App.authenticator.restore(data).then(() => {
      // Check that refreshAccessToken was scheduled
      assert.equal(Ember.run.later.getCalls().some((call) => {
        return call.args[1] === App.authenticator.refreshAccessToken &&
          call.args[2] === refreshToken;
      }), true);

      App.authenticator.refreshAccessToken.restore();
    });
  });
});


test('#restore does not schedule a token refresh when `refreshAccessTokens` is false.', assert => {
  assert.expect(1);

  const jwt = JWT.create(),
    currentTime = getConvertedTime(10000),
    expiresAt = currentTime + getConvertedTime(3000);

  sinon.stub(App.authenticator, 'getCurrentTime').callsFake(() => { return currentTime; });

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  const data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  Ember.run(() => {
    App.authenticator.restore(data).then(() => {
      // Check that refreshAccessToken was not scheduled
      assert.equal(Ember.run.later.getCalls().some((call) => {
        return call.args[1] === App.authenticator.refreshAccessToken;
      }), false);
    });
  });
});

test('#restore does not schedule a token refresh when `expiresAt` <= `now`.', assert => {
  const done = assert.async();

  assert.expect(1);

  const jwt = JWT.create(),
    expiresAt = -1;

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  const data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  Ember.run(() => {
    App.authenticator.restore(data).catch(() => {
      // Check that Ember.run.later was not called.
      assert.deepEqual(Ember.run.later.getCall(0), null);
      done();
    });
  });
});

test('#restore does not schedule a token refresh when `expiresAt` - `refreshLeeway` < `now`.', assert => {
  assert.expect(1);
  const done = assert.async();

  const jwt = JWT.create(),
    expiresAt = getConvertedTime(6000);

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  const data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  // Set the refreshLeeway to > expiresAt.
  App.authenticator.refreshLeeway = 120;

  Ember.run(() => {
    App.authenticator.restore(data).catch(() => {
      // Check that Ember.run.later was not called.
      assert.deepEqual(Ember.run.later.getCall(0), null);
      done();
    });
  });
});

test('#restore schedule access token refresh and refreshes it when time is appropriate', assert => {
  assert.expect(1);
  const done = assert.async();

  const jwt = JWT.create();

  let currentTime = getConvertedTime(10000);
  const expiresAt = currentTime + getConvertedTime(3000);

  let refreshAccessToken;
  let refreshAccessTokenTarget;
  let refreshAccessTokenArgs;

  Ember.run.later.restore();

  sinon.stub(Ember.run, 'later').callsFake((target, method, args) => {
    refreshAccessToken = method;
    refreshAccessTokenTarget = target;
    refreshAccessTokenArgs = args;

    return Math.random();
  });

  sinon.stub(App.authenticator, 'getCurrentTime').callsFake(() => { return currentTime; });

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  const data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.refreshTokenPropertyName] = refreshToken;
  data[jwt.tokenExpireName] = expiresAt;

  // Set the refreshLeeway to > expiresAt.
  App.authenticator.refreshLeeway = 120;

  Ember.run(() => {
    App.authenticator.restore(data).catch(() => {
      // Check that Ember.run.cancel was called.
      assert.deepEqual(Ember.run.cancel.getCall(1), true);
    });
  });

  currentTime = getConvertedTime(1250);
  App.authenticator.getCurrentTime.restore();
  sinon.stub(App.authenticator, 'getCurrentTime').callsFake(() => { return currentTime; });

  const refreshedToken = {};
  refreshedToken[jwt.identificationField] = 'test@test.com';
  refreshedToken[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(refreshedToken);

  App.server.respondWith('POST', '/api/token-refresh/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  assert.ok(!!refreshAccessToken, "should schedule refreshAccessToken method");

  Ember.run(() => {
    refreshAccessToken.call(refreshAccessTokenTarget, refreshAccessTokenArgs).then(response => {
      assert.deepEqual(response, { exp: expiresAt, token: token, 'refresh_token': refreshToken });
      done();
    });
  });
});

test('#restore schedule access token expiration and invalidates session when time is appropriate', assert => {
  assert.expect(3);

  const jwt = JWT.create();

  let currentTime = getConvertedTime(10000);
  const expiresAt = currentTime + getConvertedTime(3000);

  let invalidateSession;
  let invalidateSessionTarget;
  let invalidateSessionArgs;

  Ember.run.later.restore();

  sinon.stub(Ember.run, 'later', (target, method, wait) => {
    assert.equal(target, App.authenticator);
    assert.equal(method, App.authenticator.handleAccessTokenExpiration);
    assert.equal(wait, 3000000000);

    return Math.random();
  });

  sinon.stub(App.authenticator, 'getCurrentTime', () => { return currentTime; });

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  const data = {};
  data[jwt.tokenPropertyName] = token;
  data[jwt.tokenExpireName] = expiresAt;

  App.authenticator.refreshAccessTokens = false;

  Ember.run(() => {
    App.authenticator.restore(data).catch(() => {
      // Check that Ember.run.cancel was called.
      assert.deepEqual(Ember.run.cancel.getCall(1), true);
    });
  });

  currentTime = getConvertedTime(1250);
  App.authenticator.getCurrentTime.restore();
  sinon.stub(App.authenticator, 'getCurrentTime', () => { return currentTime; });

  // Ember.run(() => {
  //   invalidateSession.call(invalidateSessionTarget, invalidateSessionArgs).then(response => {
  //     console.log(response);
  //     assert.true();
  //   });
  // });
});

test('#authenticate sends an ajax request to the token endpoint', assert => {
  assert.expect(1);

  const jwt = JWT.create();

  const credentials = {
    identification: 'username',
    password: 'password'
  };

  App.authenticator.authenticate(credentials);

  Ember.run(() => {
    var args = Ember.$.ajax.getCall(0).args[0];
    delete args.beforeSend;
    assert.deepEqual(args, {
      url: jwt.serverTokenEndpoint,
      method: 'POST',
      data: '{"password":"password","username":"username"}',
      dataType: 'json',
      contentType: 'application/json',
      headers: {}
    });
  });
});

test('#authenticate rejects with invalid credentials', assert => {
  assert.expect(1);
  const done = assert.async();

  const jwt = JWT.create();

  const credentials = {
    identification: 'username',
    password: 'password'
  };

  App.server.respondWith('POST', jwt.serverTokenEndpoint, [
    400, {
      'Content-Type': 'application/json'
    },
    '{"message":["Unable to login with provided credentials."]}'
  ]);

  Ember.run(() => {
    App.authenticator.authenticate(credentials).then(null, () => {
      // Check that Ember.run.later was not called.
      assert.deepEqual(Ember.run.later.getCall(0), null);
      done();
    });
  });
});

test('#authenticate schedules a token refresh when `refreshAccessTokens` is true', assert => {
  assert.expect(1);

  const jwt = JWT.create(),
    expiresAt = new Date().getTime() + 300000;

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  const credentials = {
    identification: 'username',
    password: 'password'
  };

  App.server.respondWith('POST', jwt.serverTokenEndpoint, [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  Ember.run(() => {
    App.authenticator.authenticate(credentials).then(() => {
      // Check that refreshAccessToken was scheduled
      assert.equal(Ember.run.later.getCalls().some((call) => {
        return call.args[1] === App.authenticator.refreshAccessToken &&
          call.args[2] === refreshToken;
      }), true);
    });
  });
});

test('#authenticate does not schedule a token refresh when `refreshAccessTokens` is false', assert => {
  assert.expect(1);
  const done = assert.async();

  const jwt = JWT.create(),
    expiresAt = 3;

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  const credentials = {
    identification: 'username',
    password: 'password'
  };

  App.server.respondWith('POST', jwt.serverTokenEndpoint, [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  App.authenticator.refreshAccessTokens = false;

  Ember.run(() => {
    App.authenticator.authenticate(credentials).then(() => {
      // Check that refreshAccessToken was not scheduled
      assert.equal(Ember.run.later.getCalls().some((call) => {
        return call.args[1] === App.authenticator.refreshAccessToken;
      }), false);
    });
  });
});

test('#authenticate schedules a token expiration', assert => {
  assert.expect(1);

  const jwt = JWT.create(),
    expiresAt = new Date().getTime() + 300000;

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  const credentials = {
    identification: 'username',
    password: 'password'
  };

  App.server.respondWith('POST', jwt.serverTokenEndpoint, [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  Ember.run(() => {
    App.authenticator.authenticate(credentials).then(() => {
      // Check that expireAccessToken was scheduled
      assert.equal(Ember.run.later.getCalls().some((call) => {
        return call.args[1] === App.authenticator.handleAccessTokenExpiration;
      }), true);
    });
  });
});

test('#authenticate sends an AJAX request with custom headers', assert => {
  assert.expect(1);

  const credentials = {
    identification: 'username',
    password: 'password'
  };

  Configuration.headers = {
    'X-API-KEY': '123-abc',
    'X-ANOTHER-HEADER': 0,
    Accept: 'application/vnd.api+json'
  };

  App.authenticator = JWT.create();
  App.authenticator.authenticate(credentials);

  Ember.run(() => {
    var args = Ember.$.ajax.getCall(0).args[0];
    delete args.beforeSend;
    assert.deepEqual(args, {
      url: '/api/token-auth/',
      method: 'POST',
      data: '{"password":"password","username":"username"}',
      dataType: 'json',
      contentType: 'application/json',
      headers: {
        'X-API-KEY': '123-abc',
        'X-ANOTHER-HEADER': 0,
        Accept: 'application/vnd.api+json'
      }
    });
  });
});

test('#refreshAccessToken makes an AJAX request to the token endpoint.', assert => {
  assert.expect(1);

  const jwt = JWT.create();

  let token = createFakeRefreshToken();

  App.authenticator.refreshAccessToken(token);

  Ember.run(() => {
    var args = Ember.$.ajax.getCall(0).args[0];
    delete args.beforeSend;
    assert.deepEqual(args, {
      url: jwt.serverTokenRefreshEndpoint,
      method: 'POST',
      data: JSON.stringify({ refresh_token: token }),
      dataType: 'json',
      contentType: 'application/json',
      headers: {}
    });
  });
});

test('#refreshAccessToken makes an AJAX request to the token endpoint with nested refreshTokenPropertyName.', assert => {
  assert.expect(1);
  const jwt = JWT.create();

  let token = createFakeRefreshToken();

  App.authenticator.refreshTokenPropertyName = 'auth.nested.token';
  App.authenticator.refreshAccessToken(token);

  Ember.run(() => {
    var args = Ember.$.ajax.getCall(0).args[0];
    delete args.beforeSend;
    assert.deepEqual(args, {
      url: jwt.serverTokenRefreshEndpoint,
      method: 'POST',
      data: JSON.stringify({auth: {nested: {token: token}}}),
      dataType: 'json',
      contentType: 'application/json',
      headers: {}
    });
  });
});

test('#refreshAccessToken triggers the `sessionDataUpdated` event on successful request.', assert => {
  assert.expect(3);
  const done = assert.async();

  const jwt = JWT.create(),
    expiresAt = 3;

  sinon.stub(App.authenticator, 'scheduleAccessTokenRefresh').callsFake(() => { return null; });

  let token = {};
  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  let refreshToken = createFakeRefreshToken();

  App.server.respondWith('POST', jwt.serverTokenRefreshEndpoint, [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "' + token + '", "refresh_token": "' + refreshToken + '" }'
  ]);

  App.authenticator.refreshAccessToken(token);

  App.authenticator.one('sessionDataUpdated', data => {
    assert.ok(data[jwt.tokenExpireName], 'Verify expiresAt was added to response');
    assert.ok(data[jwt.tokenExpireName] > 0, 'Verify is greater than `now`');
    assert.deepEqual(data.token, token);
    App.authenticator.scheduleAccessTokenRefresh.restore();

    done();
  });
});

test('#refreshAccessToken invalidates session and triggers `sessionDataInvalidated` when the server responds with 401 or 403.', assert => {
  assert.expect(2);
  const done = assert.async();

  const jwt = JWT.create();
  const expiresAt = 3;

  sinon.stub(App.authenticator, 'scheduleAccessTokenRefresh').callsFake(() => { return null; });

  let token = {};

  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  App.server.respondWith('POST', jwt.serverTokenRefreshEndpoint, [
    401, {
      'Content-Type': 'application/json'
    },
    '{ "error": "Unauthorized"}'
  ]);

  const spy = sinon.spy(App.authenticator, 'invalidate');
  let dataInvalidated = false;

  App.authenticator.refreshAccessToken(token);

  App.authenticator.one('sessionDataInvalidated', () => {
    dataInvalidated = true;

    assert.equal(spy.calledOnce, true);
    assert.equal(dataInvalidated, true);
    done();
  });
});

test('#refreshAccessToken does not invalidate session when the server responds with 500.', assert => {
  assert.expect(1);

  const jwt = JWT.create();
  const expiresAt = 3;

  sinon.stub(App.authenticator, 'scheduleAccessTokenRefresh').callsFake(() => { return null; });

  let token = {};

  token[jwt.identificationField] = 'test@test.com';
  token[jwt.tokenExpireName] = expiresAt;

  token = createFakeToken(token);

  App.server.respondWith('POST', jwt.serverTokenRefreshEndpoint, [
    500, {
      'Content-Type': 'application/json'
    },
    '{ "error": "Internal Server Error"}'
  ]);

  const spy = sinon.spy(App.authenticator, 'invalidate');

  App.authenticator.refreshAccessToken(token);

  assert.equal(spy.calledOnce, false);
});

test('#getTokenData returns correct data', assert => {
  assert.expect(2);

  const jwt = JWT.create();

  const stringTokenData = 'test@test.com';
  const objectTokenData = {};

  objectTokenData[jwt.identificationField] = stringTokenData;

  const objectToken = createFakeToken(objectTokenData);
  const stringToken = createFakeToken(stringTokenData);

  assert.deepEqual(jwt.getTokenData(objectToken), objectTokenData, 'Object data returned');
  assert.equal(jwt.getTokenData(stringToken), stringTokenData, 'String data returned');
});

test('#getTokenData returns correctly encoded data', assert => {
  assert.expect(1);

  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0NTQxNzM1NzEsImRhdGEiOnsiYXV0aGVudGljYXRlZCI6dHJ1ZSwidXNlciI6eyJpZCI6IjdhMWRkYzJmLWI5MTAtNDY2Yi04MDhhLTUxOTUyOTkwZjUyNyIsIm5hbWUiOiJUaG9yYmrDuHJuIEhlcm1hbnNlbiIsIm1vYmlsZSI6IjQwNDUxMzg5IiwiZW1haWwiOiJ0aEBza2FsYXIubm8iLCJsb2NhbGUiOiJuYiIsInNpZ25faW5fY291bnQiOjI1fX19.se8PT5e1G1_xhPTQf_16BIv0Q9uEjQxLGE3iTJwhAec';
  const jwt = JWT.create();

  const data = jwt.getTokenData(token);
  assert.equal(data.data.user.name, 'Thorbjørn Hermansen', 'Correctly decodes JWT data');
});
