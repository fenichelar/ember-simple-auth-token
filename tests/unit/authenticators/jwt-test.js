import { module } from 'qunit';
import { test } from 'ember-qunit';
import sinon from 'sinon';
import startApp from '../../helpers/start-app';
import * as fetchWrapper from 'fetch';
import * as runWrapper from '@ember/runloop';
import { run } from '@ember/runloop';
import { assign } from '@ember/polyfills';
import JWT from 'ember-simple-auth-token/authenticators/jwt';

let App;

const createFakeCredentials = () => {
  return {
    username: 'test@test.com',
    password: 'password'
  };
};

const createFakeToken = obj => {
  return `a.${btoa(JSON.stringify(obj))}.b`;
};

const createFakeRefreshToken = () => {
  return btoa('91df47a8-8c7f-4411-98e7-43bfd32df5c4');
};

const getConvertedTime = time => {
  return Math.round(time / 1000);
};

module('JWT Authenticator', {
  beforeEach() {
    App = startApp();
    App.xhr = sinon.useFakeXMLHttpRequest();
    App.server = sinon.fakeServer.create();
    App.server.autoRespond = true;
    App.authenticator = JWT.create();
    sinon.spy(fetchWrapper, 'default');
    sinon.spy(runWrapper, 'later');
    sinon.spy(App.authenticator, 'invalidate');
    sinon.spy(App.authenticator, 'refreshAccessToken');
    sinon.spy(App.authenticator, 'scheduleAccessTokenRefresh');
  },
  afterEach() {
    run(App, App.destroy);
    App.xhr.restore();
    App.server.restore();
    fetchWrapper.default.restore();
    runWrapper.later.restore();
    App.authenticator.invalidate.restore();
    App.authenticator.refreshAccessToken.restore();
    App.authenticator.scheduleAccessTokenRefresh.restore();
  }
});

test('#restore resolves when the data includes `token` and `expiresAt`', assert => {
  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const tokenData = {
    [App.authenticator.tokenExpireName]: expiresAt
  };
  const token = createFakeToken(tokenData);
  const refreshToken = createFakeRefreshToken();
  const data = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.tokenExpireName]: expiresAt,
    [App.authenticator.tokenDataPropertyName]: tokenData
  };
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).then(content => {
    assert.deepEqual(content, data);
  });
});

test('#restore resolves when the data includes `token` and excludes `expiresAt`', assert => {
  const token = createFakeToken();
  const refreshToken = createFakeRefreshToken();
  const data = {
    [App.authenticator.tokenPropertyName]: token
  };
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).then(content => {
    assert.deepEqual(content, data);
  });
});

test('#restore resolves when the data includes `token` and `expiresAt` and the token is expired', assert => {
  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime - 60 * 60;
  const tokenData = {
    [App.authenticator.tokenExpireName]: expiresAt
  };
  const token = createFakeToken(tokenData);
  const refreshToken = createFakeRefreshToken();
  const data = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken,
    [App.authenticator.tokenExpireName]: expiresAt,
    [App.authenticator.tokenDataPropertyName]: tokenData
  };
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).then(content => {
    assert.deepEqual(content, data);
  });
});

test('#restore rejects when the data includes `token` and `expiresAt`, the token is expired, and `refreshAccessTokens` is false', assert => {
  App.authenticator.refreshAccessTokens = false;

  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime - 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const data = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.tokenExpireName]: expiresAt
  };
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).catch(() => {
    assert.ok(true);
  });
});

test('#restore resolves when the data includes `token` and `expiresAt` and `tokenPropertyName` is a nested object', assert => {
  App.authenticator.tokenPropertyName = 'auth.nested.token';

  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const data = {
    auth: {
      nested: {
        token: token
      }
    },
    [App.authenticator.tokenExpireName]: expiresAt
  };
  const response = {
    auth: {
      nested: {
        token: token
      }
    },
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).then(content => {
    assert.deepEqual(content, data);
  });
});

test('#restore rejects when `token` is excluded', assert => {
  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const refreshToken = createFakeRefreshToken();
  const data = {
    [App.authenticator.tokenPropertyName]: null,
    [App.authenticator.tokenExpireName]: expiresAt
  };
  const response = {
    [App.authenticator.tokenPropertyName]: null,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).catch(() => {
    assert.ok(true);
  });
});

test('#restore schedules a token refresh when `refreshAccessTokens` is true', assert => {
  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const data = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.tokenExpireName]: expiresAt,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).then(() => {
    assert.equal(runWrapper.later.getCalls().some(call => {
      return call.args[1] === App.authenticator.refreshAccessToken && call.args[2] === refreshToken;
    }), true);
  });
});

test('#restore does not schedule a token refresh when `refreshAccessTokens` is false', assert => {
  App.authenticator.refreshAccessTokens = false;

  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const data = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.tokenExpireName]: expiresAt,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).then(() => {
    assert.equal(runWrapper.later.getCalls().some(call => {
      return call.args[1] === App.authenticator.refreshAccessToken;
    }), false);
  });
});

test('#restore does not schedule a token refresh when the token is expired', assert => {
  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime - 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const data = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.tokenExpireName]: expiresAt,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).then(() => {
    assert.equal(runWrapper.later.getCalls().some(call => {
      return call.args[1] === App.authenticator.refreshAccessToken;
    }), false);
  });
});

test('#restore schedules a token refresh when the token is farther than the `refreshLeeway` to expiration', assert => {
  App.authenticator.refreshLeeway = 30;

  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const data = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.tokenExpireName]: expiresAt,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).then(() => {
    assert.equal(runWrapper.later.getCalls().some(call => {
      return call.args[1] === App.authenticator.refreshAccessToken && call.args[2] === refreshToken;
    }), true);
  });
});

test('#restore does not schedule a token refresh when the token is closer than the `refreshLeeway` to expiration', assert => {
  App.authenticator.refreshLeeway = 120;

  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const data = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.tokenExpireName]: expiresAt,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(data).catch(() => {
    assert.equal(runWrapper.later.getCalls().some(call => {
      return call.args[1] === App.authenticator.refreshAccessToken;
    }), false);
  });
});

test('#authenticate successfully resolves with the correct data', assert => {
  const token = createFakeToken();
  const refreshToken = createFakeRefreshToken();
  const credentials = createFakeCredentials();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const refreshResponse = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);
  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(refreshResponse)
  ]);

  return App.authenticator.authenticate(credentials).then(data => {
    delete data[App.authenticator.tokenExpireName];
    delete data[App.authenticator.tokenDataPropertyName];
    assert.deepEqual(data, response);
  });
});

test('#authenticate sends a fetch request to the token endpoint', assert => {
  assert.expect(2);

  const token = createFakeToken();
  const refreshToken = createFakeRefreshToken();
  const credentials = createFakeCredentials();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const refreshResponse = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);
  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(refreshResponse)
  ]);

  return App.authenticator.authenticate(credentials).then(() => {
    const args = fetchWrapper.default.getCall(0).args;
    assert.equal(args[0], App.authenticator.serverTokenEndpoint);
    assert.deepEqual(args[1], {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  });
});

test('#authenticate sends a fetch request to the token endpoint when `tokenPropertyName` is a nested object', assert => {
  assert.expect(2);

  App.authenticator.tokenPropertyName = 'auth.nested.token';

  const token = createFakeToken();
  const refreshToken = createFakeRefreshToken();
  const credentials = createFakeCredentials();
  const response = {
    auth: {
      nested: {
        token: token
      }
    },
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const refreshResponse = {
    auth: {
      nested: {
        token: token
      }
    },
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);
  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(refreshResponse)
  ]);

  return App.authenticator.authenticate(credentials).then(() => {
    const args = fetchWrapper.default.getCall(0).args;
    assert.equal(args[0], App.authenticator.serverTokenEndpoint);
    assert.deepEqual(args[1], {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  });
});

test('#authenticate sends an fetch request with custom headers', assert => {
  assert.expect(2);

  App.authenticator.headers = {
    'X-API-KEY': '123-abc',
    'X-ANOTHER-HEADER': 0,
    'Accept': 'application/vnd.api+json'
  };

  const token = createFakeToken();
  const refreshToken = createFakeRefreshToken();
  const credentials = createFakeCredentials();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const refreshResponse = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);
  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(refreshResponse)
  ]);

  return App.authenticator.authenticate(credentials).then(() => {
    const args = fetchWrapper.default.getCall(0).args;
    assert.equal(args[0], App.authenticator.serverTokenEndpoint);
    assert.deepEqual(args[1], {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, App.authenticator.headers)
    });
  });
});

test('#authenticate sends an fetch request with dynamic headers', assert => {
  assert.expect(2);

  const headers = {
    'X-API-KEY': '123-abc',
    'X-ANOTHER-HEADER': 0,
    'Accept': 'application/vnd.api+json'
  };

  const token = createFakeToken();
  const refreshToken = createFakeRefreshToken();
  const credentials = createFakeCredentials();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const refreshResponse = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);
  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(refreshResponse)
  ]);

  return App.authenticator.authenticate(credentials, headers).then(() => {
    const args = fetchWrapper.default.getCall(0).args;
    assert.equal(args[0], App.authenticator.serverTokenEndpoint);
    assert.deepEqual(args[1], {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, headers)
    });
  });
});

test('#authenticate rejects with the correct error', assert => {
  const credentials = createFakeCredentials();

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    400,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify({})
  ]);

  return App.authenticator.authenticate(credentials).catch(error => {
    assert.equal(error.status, 400);
  });
});

test('#authenticate schedules a token refresh when `refreshAccessTokens` is true', assert => {
  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const credentials = createFakeCredentials();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const refreshResponse = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);
  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(refreshResponse)
  ]);

  return App.authenticator.authenticate(credentials).then(() => {
    assert.equal(runWrapper.later.getCalls().some(call => {
      return call.args[1] === App.authenticator.refreshAccessToken && call.args[2] === refreshToken;
    }), true);
  });
});

test('#authenticate does not schedule a token refresh when `refreshAccessTokens` is false', assert => {
  App.authenticator.refreshAccessTokens = false;

  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const credentials = createFakeCredentials();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const refreshResponse = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);
  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(refreshResponse)
  ]);

  return App.authenticator.authenticate(credentials).then(() => {
    assert.equal(runWrapper.later.getCalls().some(call => {
      return call.args[1] === App.authenticator.refreshAccessToken;
    }), false);
  });
});

test('#authenticate does not schedule a token refresh when the token is expired', assert => {
  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime - 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const credentials = createFakeCredentials();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const refreshResponse = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);
  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(refreshResponse)
  ]);

  return App.authenticator.authenticate(credentials).then(() => {
    assert.equal(runWrapper.later.getCalls().some(call => {
      return call.args[1] === App.authenticator.refreshAccessToken;
    }), false);
  });
});

test('#authenticate schedules a token refresh when the token is farther than the `refreshLeeway` to expiration', assert => {
  App.authenticator.refreshLeeway = 30;

  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const credentials = createFakeCredentials();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const refreshResponse = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);
  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(refreshResponse)
  ]);

  return App.authenticator.authenticate(credentials).then(() => {
    assert.equal(runWrapper.later.getCalls().some(call => {
      return call.args[1] === App.authenticator.refreshAccessToken && call.args[2] === refreshToken;
    }), true);
  });
});

test('#authenticate does not schedule a token refresh when the token is closer than the `refreshLeeway` to expiration', assert => {
  App.authenticator.refreshLeeway = 120;

  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const credentials = createFakeCredentials();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };
  const refreshResponse = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);
  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(refreshResponse)
  ]);

  return App.authenticator.authenticate(credentials).catch(() => {
    assert.equal(runWrapper.later.getCalls().some(call => {
      return call.args[1] === App.authenticator.refreshAccessToken;
    }), false);
  });
});

test('#refreshAccessToken sends an fetch request to the refresh token endpoint', assert => {
  assert.expect(2);

  const token = createFakeToken();
  const refreshToken = createFakeRefreshToken();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.refreshAccessToken(refreshToken).then(() => {
    const args = fetchWrapper.default.getCall(0).args;
    assert.equal(args[0], App.authenticator.serverTokenRefreshEndpoint);
    assert.deepEqual(args[1], {
      method: 'POST',
      body: JSON.stringify({
        [App.authenticator.refreshTokenPropertyName]: refreshToken
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  });
});

test('#refreshAccessToken sends an fetch request to the refresh token endpoint when `refreshTokenPropertyName` is a nested object', assert => {
  assert.expect(2);

  App.authenticator.refreshTokenPropertyName = 'auth.nested.refreshToken';

  const token = createFakeToken();
  const refreshToken = createFakeRefreshToken();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    auth: {
      nested: {
        refreshToken: refreshToken
      }
    }
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.refreshAccessToken(refreshToken).then(() => {
    const args = fetchWrapper.default.getCall(0).args;
    assert.equal(args[0], App.authenticator.serverTokenRefreshEndpoint);
    assert.deepEqual(args[1], {
      method: 'POST',
      body: JSON.stringify({
        auth: {
          nested: {
            refreshToken: refreshToken
          }
        }
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  });
});

test('#refreshAccessToken sends an fetch request with custom headers', assert => {
  assert.expect(2);

  App.authenticator.headers = {
    'X-API-KEY': '123-abc',
    'X-ANOTHER-HEADER': 0,
    'Accept': 'application/vnd.api+json'
  };

  const token = createFakeToken();
  const refreshToken = createFakeRefreshToken();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.refreshAccessToken(refreshToken).then(() => {
    const args = fetchWrapper.default.getCall(0).args;
    assert.equal(args[0], App.authenticator.serverTokenRefreshEndpoint);
    assert.deepEqual(args[1], {
      method: 'POST',
      body: JSON.stringify({
        [App.authenticator.refreshTokenPropertyName]: refreshToken
      }),
      headers: assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, App.authenticator.headers)
    });
  });
});

test('#refreshAccessToken triggers the `sessionDataUpdated` event on successful request', assert => {
  assert.expect(3);

  const currentTime = getConvertedTime(Date.now());
  const expiresAt = currentTime + 60;
  const token = createFakeToken({
    [App.authenticator.tokenExpireName]: expiresAt
  });
  const refreshToken = createFakeRefreshToken();
  const response = {
    [App.authenticator.tokenPropertyName]: token,
    [App.authenticator.refreshTokenPropertyName]: refreshToken
  };

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.refreshAccessToken(refreshToken).then(data => {
    assert.ok(data[App.authenticator.tokenExpireName]);
    assert.ok(data[App.authenticator.tokenExpireName] > 0);
    assert.deepEqual(data.token, token);
  });
});


test('#refreshAccessToken invalidates session when the server responds with 401', assert => {
  const refreshToken = createFakeRefreshToken();

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    401,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify({})
  ]);

  return App.authenticator.refreshAccessToken(refreshToken).catch(() => {
    assert.equal(App.authenticator.invalidate.calledOnce, true);
  });
});

test('#refreshAccessToken invalidates session when the server responds with 403', assert => {
  const refreshToken = createFakeRefreshToken();

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    403,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify({})
  ]);

  return App.authenticator.refreshAccessToken(refreshToken).catch(() => {
    assert.equal(App.authenticator.invalidate.calledOnce, true);
  });
});

test('#refreshAccessToken does not invalidate session when the server responds with 500', assert => {
  const refreshToken = createFakeRefreshToken();

  App.server.respondWith('POST', App.authenticator.serverTokenRefreshEndpoint, [
    500,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify({})
  ]);

  return App.authenticator.refreshAccessToken(refreshToken).catch(() => {
    assert.equal(App.authenticator.invalidate.calledOnce, false);
  });
});

test('#getTokenData returns correct data', assert => {
  assert.expect(2);

  const stringTokenData = 'test@test.com';
  const objectTokenData = {
    username: stringTokenData
  };

  const objectToken = createFakeToken(objectTokenData);
  const stringToken = createFakeToken(stringTokenData);

  assert.deepEqual(App.authenticator.getTokenData(objectToken), objectTokenData);
  assert.equal(App.authenticator.getTokenData(stringToken), stringTokenData);
});

test('#getTokenData returns correctly encoded data', assert => {
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0NTQxNzM1NzEsImRhdGEiOnsiYXV0aGVudGljYXRlZCI6dHJ1ZSwidXNlciI6eyJpZCI6IjdhMWRkYzJmLWI5MTAtNDY2Yi04MDhhLTUxOTUyOTkwZjUyNyIsIm5hbWUiOiJUaG9yYmrDuHJuIEhlcm1hbnNlbiIsIm1vYmlsZSI6IjQwNDUxMzg5IiwiZW1haWwiOiJ0aEBza2FsYXIubm8iLCJsb2NhbGUiOiJuYiIsInNpZ25faW5fY291bnQiOjI1fX19.se8PT5e1G1_xhPTQf_16BIv0Q9uEjQxLGE3iTJwhAec';

  const data = App.authenticator.getTokenData(token);
  assert.equal(data.data.user.name, 'Thorbjørn Hermansen');
});
