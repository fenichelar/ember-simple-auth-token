import { module, test } from 'qunit';
import { setupTest } from 'test-app/tests/helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { getSettledState } from '@ember/test-helpers';
import { sign } from 'jsonwebtoken';
import sinon from 'sinon';

const secret = 'secret';

const payload = {
  userAccount: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName'
  }
};

const options = {
  expiresIn: '5m',
  algorithm: 'HS512',
};

module('Unit | Authenticator | authenticators/jwt.js', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.owner.application.jwt = this.owner.lookup('authenticator:jwt');
  });

  const createFakeCredentials = () => {
    return {
      username: 'username',
      password: 'password'
    };
  };

  const createFakeToken = obj => {
    let encryptPayload = {...payload};
    let encryptOptions = {...options};
    if (typeof obj === 'string'){
      return `a.${btoa(JSON.stringify(obj))}.b`;
    } else if (obj) {
      if (obj.exp) {
        encryptOptions.expiresIn = obj.exp;
      } else if (obj.username) {
        encryptPayload = obj;
      }
    }
    return sign(encryptPayload, secret, encryptOptions);
  };

  const getConvertedTime = time => {
    return Math.round(time / 1000);
  };

  const clearState = jwt => {
    let state = getSettledState();
    if (state.hasPendingTimers || state.hasRunLoop) {
      jwt.cancelAllTimers();
    }
  };

  test('authenticators/jwt exists', function(assert) {
    assert.expect(1);
    assert.ok(this.owner.application.jwt.getCurrentTime());
  });

  test('getCurrentTime works', function(assert) {
    assert.expect(1);
    assert.strictEqual(this.owner.application.jwt.getCurrentTime(), Math.floor(new Date().valueOf() / 1000));
  });

  test('#restore resolves when the data includes `token` and `expiresAt`', function(assert) {
    assert.expect(1);

    const expiresAt = getConvertedTime(Date.now()) + 60;
    const tokenData = {
      exp: expiresAt
    };
    const token = createFakeToken({
      exp: expiresAt
    });
    const data = {
      token: token,
      exp: expiresAt,
      tokenData: tokenData
    };

    this.owner.application.jwt.restore(data).then(content => {
      assert.propEqual(content, data);
    });
  });

  test('#restore resolves when the data includes `token` and excludes `expiresAt`', function(assert) {
    assert.expect(1);

    const token = createFakeToken();
    const data = {
      token: token
    };

    this.owner.application.jwt.restore(data).then(content => {
      assert.propEqual(content, data);
    });
  });


  test('#restore resolves when the data includes `token` and `expiresAt` and the token is expired', function(assert) {
    assert.expect(1);

    const expiresAt = getConvertedTime(Date.now()) - 60 * 60;
    const tokenData = {
      exp: expiresAt
    };
    const token = createFakeToken(tokenData);
    const refreshToken = createFakeToken();
    const data = {
      token: token,
      refresh_token: refreshToken,
      exp: expiresAt,
      tokenData: tokenData
    };

    this.owner.application.jwt.restore(data).catch(err => {
      assert.strictEqual(err.toString(), 'Error: token is expired');
    });
  });

  test('#restore rejects when the data includes `token` and `expiresAt`, the token is expired, and `refreshAccessTokens` is false', function(assert) {
    assert.expect(1);

    const expiresAt = getConvertedTime(Date.now()) - 60;
    const token = createFakeToken({
      exp: expiresAt
    });
    const data = {
      token: token,
      exp: expiresAt
    };

    this.owner.application.jwt.restore(data).catch(err => {
      assert.strictEqual(err.toString(), 'Error: token is expired');
    });
  });

  test('#restore resolves when the data includes `token` and `expiresAt` and `tokenPropertyName` is a nested object', function(assert) {
    assert.expect(1);

    this.owner.application.jwt.tokenPropertyName = 'auth.nested.token';

    const expiresAt = getConvertedTime(Date.now()) + 60;
    const token = createFakeToken({
      exp: expiresAt
    });
    const data = {
      auth: {
        nested: {
          token: token
        }
      },
      exp: expiresAt
    };

    this.owner.application.jwt.restore(data).then(content => {
      assert.propEqual(content, data);
    });
  });

  test('#restore rejects when `token` is excluded', function(assert) {
    assert.expect(1);

    const expiresAt = getConvertedTime(Date.now()) + 60;
    const data = {
      token: null,
      exp: expiresAt
    };

    this.owner.application.jwt.restore(data).catch(response => {
      assert.strictEqual(response.toString(), 'Error: empty token');
    });
  });

  test('#restore schedules a token refresh when `refreshAccessTokens` is true', function(assert) {
    assert.expect(1);

    this.owner.application.jwt.refreshAccessTokens = true;
    sinon.spy(this.owner.application.jwt, 'scheduleAccessTokenRefresh');

    const expiresAt = getConvertedTime(Date.now()) + 60;
    const token = createFakeToken({
      exp: expiresAt
    });
    const refreshToken = createFakeToken();
    const data = {
      token: token,
      exp: expiresAt,
      refresh_token: refreshToken
    };

    this.owner.application.jwt.restore(data).then(() => {
      assert.strictEqual(this.owner.application.jwt.scheduleAccessTokenRefresh.callCount, 1);
      clearState(this.owner.application.jwt);
    });
  });

  test('#restore does not schedule a token refresh when `refreshAccessTokens` is false', function(assert) {
    assert.expect(1);

    sinon.spy(this.owner.application.jwt, 'scheduleAccessTokenRefresh');

    const expiresAt = getConvertedTime(Date.now()) + 60;
    const token = createFakeToken({
      exp: expiresAt
    });
    const refreshToken = createFakeToken();
    const credentials = createFakeCredentials();
    const data = {
      token: token,
      exp: expiresAt,
      refresh_token: refreshToken
    };

    this.server.pretender.handledRequest = (verb, path, request) => {
      assert.strictEqual(path, 'http://localhost:8080/api/token-auth');
      assert.strictEqual(verb, 'POST');
      assert.strictEqual(request.requestBody, JSON.stringify(credentials));
      assert.strictEqual(JSON.stringify(request.requestHeaders), JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }));
    };

    this.owner.application.jwt.restore(data).then(() => {
      assert.strictEqual(this.owner.application.jwt.scheduleAccessTokenRefresh.callCount, 0);
    });
  });

  test('#restore immediately refreshes the token when the token is expired', function(assert) {
    assert.expect(1);

    this.owner.application.jwt.refreshAccessTokens = true;
    sinon.spy(this.owner.application.jwt, 'refreshAccessToken');

    const expiresAt = getConvertedTime(Date.now()) - 60;
    let token = createFakeToken({
      exp: expiresAt
    });

    const data = {
      token: token,
      exp: expiresAt,
      refresh_token: token
    };
    this.owner.application.jwt.restore(data).then(() => {
      assert.strictEqual(this.owner.application.jwt.refreshAccessToken.callCount, 1);
      clearState(this.owner.application.jwt);
    });
  });

  test('#restore schedules a token refresh when the token is farther than the `refreshLeeway` to expiration', function(assert) {
    assert.expect(1);

    this.owner.application.jwt.refreshLeeway = 1;
    this.owner.application.jwt.refreshAccessTokens = true;
    sinon.spy(this.owner.application.jwt, 'scheduleAccessTokenRefresh');

    const expiresAt = getConvertedTime(Date.now()) + 60;
    const token = createFakeToken({
      exp: expiresAt
    });
    const refreshToken = createFakeToken();
    const data = {
      token: token,
      exp: expiresAt,
      refresh_token: refreshToken
    };

    this.owner.application.jwt.restore(data).then(() => {
      assert.strictEqual(this.owner.application.jwt.scheduleAccessTokenRefresh.callCount, 1);
      clearState(this.owner.application.jwt);
    });
  });

  test('#restore immediately refreshes the token when the token is closer than the `refreshLeeway` to expiration', function(assert) {
    assert.expect(1);

    this.owner.application.jwt.refreshLeeway = 120;
    this.owner.application.jwt.refreshAccessTokens = true;
    sinon.spy(this.owner.application.jwt, 'refreshAccessToken');

    const expiresAt = getConvertedTime(Date.now()) + 60;
    const token = createFakeToken({
      exp: expiresAt
    });
    const refreshToken = createFakeToken();
    const data = {
      token: token,
      exp: expiresAt,
      refresh_token: refreshToken
    };

    this.owner.application.jwt.restore(data).then(() => {
      assert.strictEqual(this.owner.application.jwt.refreshAccessToken.callCount, 1);
      clearState(this.owner.application.jwt);
    });
  });

  test('#authenticate successfully resolves with the correct data', function(assert) {
    assert.expect(1);

    const token = createFakeToken();
    const refreshToken = createFakeToken();
    const credentials = createFakeCredentials();
    const response = {
      token: token,
      refresh_token: refreshToken
    };

    this.server.post('/token-auth', () => ({
      token: token,
      refresh_token: refreshToken
    }), 200);

    this.owner.application.jwt.authenticate(credentials).then(data => {
      delete data.exp;
      delete data.tokenData;
      assert.propEqual(data, response);
    });
  });

  test('#authenticate sends a fetch request to the token endpoint', function(assert) {
    assert.expect(4);

    const token = createFakeToken();
    const credentials = createFakeCredentials();

    this.server.post('/token-auth', () => ({
      token: token,
      refresh_token: token
    }), 200);

    this.server.pretender.handledRequest = (verb, path, request) => {
      assert.strictEqual(path, 'http://localhost:8080/api/token-auth');
      assert.strictEqual(verb, 'POST');
      assert.strictEqual(request.requestBody, JSON.stringify(credentials));
      assert.strictEqual(JSON.stringify(request.requestHeaders), JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }));
    };

    this.owner.application.jwt.authenticate(credentials);
  });

  test('#authenticate sends a fetch request to the token endpoint when `tokenPropertyName` is a nested object', function(assert) {
    assert.expect(4);

    this.owner.application.jwt.tokenPropertyName = 'auth.nested.token';

    const token = createFakeToken();

    this.server.post('/token-auth', () => ({
      auth: {nested: {token: token}},
      refresh_token: token
    }), 200);

    const credentials = createFakeCredentials();

    this.server.pretender.handledRequest = (verb, path, request) => {
      assert.strictEqual(path, 'http://localhost:8080/api/token-auth');
      assert.strictEqual(verb, 'POST');
      assert.strictEqual(request.requestBody, JSON.stringify(credentials));
      assert.strictEqual(JSON.stringify(request.requestHeaders), JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }));
    };

    this.owner.application.jwt.authenticate(credentials);
  });

  test('#authenticate sends an fetch request with custom headers', function(assert) {
    assert.expect(4);

    this.owner.application.jwt.headers = {
      'X-API-KEY': '123-abc',
      'X-ANOTHER-HEADER': 0,
      'Accept': 'application/json'
    };

    const credentials = createFakeCredentials();

    this.server.pretender.handledRequest = (verb, path, request) => {
      assert.strictEqual(path, 'http://localhost:8080/api/token-auth');
      assert.strictEqual(verb, 'POST');
      assert.strictEqual(request.requestBody, JSON.stringify(credentials));
      assert.strictEqual(JSON.stringify(request.requestHeaders), JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': '123-abc',
        'X-ANOTHER-HEADER': '0',
      }));
    };

    this.owner.application.jwt.authenticate(credentials);
  });

  test('#authenticate sends an fetch request with dynamic headers', function(assert) {
    assert.expect(4);

    const headers = {
      'X-API-KEY': '123-abc',
      'X-ANOTHER-HEADER': 0,
      'Accept': 'application/json'
    };

    const credentials = createFakeCredentials();

    this.server.pretender.handledRequest = (verb, path, request) => {
      assert.strictEqual(path, 'http://localhost:8080/api/token-auth');
      assert.strictEqual(verb, 'POST');
      assert.strictEqual(request.requestBody, JSON.stringify(credentials));
      assert.strictEqual(JSON.stringify(request.requestHeaders), JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': '123-abc',
        'X-ANOTHER-HEADER': '0',
      }));
    };

    this.owner.application.jwt.authenticate(credentials, headers);
  });

  test('#authenticate rejects with the correct error', function(assert) {
    assert.expect(1);

    this.owner.application.jwt.authenticate({username: 'username', password: 'incorrectPassword'}).catch(error => {
      assert.strictEqual(error.status, 401);
    });
  });

  test('#authenticate schedules a token refresh when `refreshAccessTokens` is true', function(assert) {
    assert.expect(1);

    this.owner.application.jwt.refreshAccessTokens = true;
    sinon.spy(this.owner.application.jwt, 'scheduleAccessTokenRefresh');

    const credentials = createFakeCredentials();

    this.owner.application.jwt.authenticate(credentials).then(() => {
      assert.strictEqual(this.owner.application.jwt.scheduleAccessTokenRefresh.callCount, 1);
      clearState(this.owner.application.jwt);
    });
  });

  test('#authenticate does not schedule a token refresh when `refreshAccessTokens` is false', function(assert) {
    assert.expect(1);

    sinon.spy(this.owner.application.jwt, 'scheduleAccessTokenRefresh');

    const credentials = createFakeCredentials();

    this.owner.application.jwt.authenticate(credentials).then(() => {
      assert.strictEqual(this.owner.application.jwt.scheduleAccessTokenRefresh.callCount, 0);
    });
  });

  test('#authenticate immediately refreshes the token when the token is expired', function(assert) {
    assert.expect(1);

    sinon.spy(this.owner.application.jwt, 'refreshAccessToken');

    const credentials = createFakeCredentials();

    this.owner.application.jwt.authenticate(credentials).then(() => {
      assert.strictEqual(this.owner.application.jwt.refreshAccessToken.callCount, 0);
    });
  });

  test('#authenticate schedules a token refresh when the token is farther than the `refreshLeeway` to expiration', function(assert) {
    assert.expect(1);

    this.owner.application.jwt.refreshAccessTokens = true;
    this.owner.application.jwt.refreshLeeway = 1;
    sinon.spy(this.owner.application.jwt, 'scheduleAccessTokenRefresh');

    const credentials = createFakeCredentials();

    this.owner.application.jwt.authenticate(credentials).then(() => {
      assert.strictEqual(this.owner.application.jwt.scheduleAccessTokenRefresh.callCount, 1);
      clearState(this.owner.application.jwt);
    });
  });

  test('#refreshAccessToken sends a fetch request to the refresh token endpoint', function(assert) {
    assert.expect(4);

    const refreshToken = createFakeToken();

    this.server.pretender.handledRequest = (verb, path, request) => {
      assert.strictEqual(path, 'http://localhost:8080/api/token-refresh/');
      assert.strictEqual(verb, 'POST');
      assert.strictEqual(request.requestBody, JSON.stringify({refresh_token: refreshToken}));
      assert.strictEqual(JSON.stringify(request.requestHeaders), JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }));
    };

    this.owner.application.jwt.refreshAccessToken(refreshToken);
  });

  test('#refreshAccessToken sends an fetch request to the refresh token endpoint when `refreshTokenPropertyName` is a nested object', function(assert) {
    assert.expect(4);

    this.owner.application.jwt.tokenPropertyName = 'auth.nested.token';
    this.owner.application.jwt.refreshTokenPropertyName = 'auth.nested.refreshToken';

    const token = createFakeToken();
    const refreshToken = createFakeToken();

    this.server.post('/token-refresh', () => ({
      auth: {nested: {token: token}},
      refresh_token: token
    }), 200);

    this.server.pretender.handledRequest = (verb, path, request) => {
      assert.strictEqual(path, 'http://localhost:8080/api/token-refresh/');
      assert.strictEqual(verb, 'POST');
      assert.strictEqual(request.requestBody, JSON.stringify({
        auth: {
          nested: {
            refreshToken: refreshToken
          }
        }
      }));
      assert.strictEqual(JSON.stringify(request.requestHeaders), JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }));
    };

    this.owner.application.jwt.refreshAccessToken(refreshToken);
  });

  test('#refreshAccessToken sends an fetch request with custom headers', function(assert) {
    assert.expect(4);

    this.owner.application.jwt.headers = {
      'X-API-KEY': '123-abc',
      'X-ANOTHER-HEADER': 0,
      'Accept': 'application/json'
    };

    const refreshToken = createFakeToken();

    this.server.pretender.handledRequest = (verb, path, request) => {
      assert.strictEqual(path, 'http://localhost:8080/api/token-refresh/');
      assert.strictEqual(verb, 'POST');
      assert.strictEqual(request.requestBody, JSON.stringify({refresh_token: refreshToken}));
      assert.strictEqual(JSON.stringify(request.requestHeaders), JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': '123-abc',
        'X-ANOTHER-HEADER': '0',
      }));
    };

    this.owner.application.jwt.refreshAccessToken(refreshToken);
  });

  test('#refreshAccessToken triggers the `sessionDataUpdated` event on successful request', function(assert) {
    assert.expect(3);

    const expiresAt = getConvertedTime(Date.now()) + 60;
    const token = createFakeToken({
      exp: expiresAt
    });
    const refreshToken = createFakeToken();

    this.server.post('/token-refresh', () => ({
      token: token,
      refresh_token: token
    }), 200);

    this.owner.application.jwt.refreshAccessToken(refreshToken).then(data => {
      assert.ok(data.exp);
      assert.ok(data.exp > 0);
      assert.propEqual(data.token, token);
    });
  });


  test('#refreshAccessToken invalidates session when the server responds with 401', function(assert) {
    assert.expect(1);

    const token = createFakeToken();

    sinon.spy(this.owner.application.jwt, 'invalidate');

    this.server.post('/token-refresh', () => ({}), 401);

    this.owner.application.jwt.refreshAccessToken(token).catch(() => {
      assert.strictEqual(this.owner.application.jwt.invalidate.callCount, 1);
    });
  });

  test('#refreshAccessToken invalidates session when the server responds with 403', function(assert) {
    assert.expect(1);

    const refreshToken = createFakeToken();

    sinon.spy(this.owner.application.jwt, 'invalidate');

    this.server.post('/token-refresh', () => ({}), 403);

    this.owner.application.jwt.refreshAccessToken(refreshToken).catch(() => {
      assert.strictEqual(this.owner.application.jwt.invalidate.callCount, 1);
    });
  });

  test('#refreshAccessToken does not invalidate session when the server responds with 500', function(assert) {
    assert.expect(1);

    const refreshToken = createFakeToken();

    sinon.spy(this.owner.application.jwt, 'invalidate');

    this.server.post('/token-refresh', () => ({}), 500);

    this.owner.application.jwt.refreshAccessToken(refreshToken).catch(() => {
      assert.strictEqual(this.owner.application.jwt.invalidate.callCount, 0);
    });
  });

  test('#getTokenData returns correct data', function(assert) {
    assert.expect(2);

    const stringTokenData = 'test@test.com';
    const objectTokenData = {
      username: stringTokenData
    };

    const objectToken = createFakeToken(objectTokenData);
    const stringToken = createFakeToken(stringTokenData);

    assert.strictEqual(this.owner.application.jwt.getTokenData(objectToken).username, objectTokenData.username);
    assert.strictEqual(this.owner.application.jwt.getTokenData(stringToken), stringTokenData);
  });

  test('#getTokenData returns correctly encoded data', function(assert) {
    assert.expect(1);

    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE0NTQxNzM1NzEsImRhdGEiOnsiYXV0aGVudGljYXRlZCI6dHJ1ZSwidXNlciI6eyJpZCI6IjdhMWRkYzJmLWI5MTAtNDY2Yi04MDhhLTUxOTUyOTkwZjUyNyIsIm5hbWUiOiJUaG9yYmrDuHJuIEhlcm1hbnNlbiIsIm1vYmlsZSI6IjQwNDUxMzg5IiwiZW1haWwiOiJ0aEBza2FsYXIubm8iLCJsb2NhbGUiOiJuYiIsInNpZ25faW5fY291bnQiOjI1fX19.se8PT5e1G1_xhPTQf_16BIv0Q9uEjQxLGE3iTJwhAec';

    const data = this.owner.application.jwt.getTokenData(token);
    assert.strictEqual(data.data.user.name, 'Thorbjørn Hermansen');
  });

  test('#handleAuthResponse uses custom tokenDataPropertyName', function(assert) {
    assert.expect(2);

    const customPropertyName = 'customTokenData';
    this.owner.application.jwt.tokenDataPropertyName = customPropertyName;

    const token = createFakeToken();
    const refreshToken = createFakeToken();
    const credentials = createFakeCredentials();
    const expectedTokenData = this.owner.application.jwt.getTokenData(token);

    this.server.post('/token-auth', () => ({
      token: token,
      refresh_token: refreshToken
    }), 200);

    this.owner.application.jwt.authenticate(credentials).then(data => {
      assert.ok(data[customPropertyName], 'Session data contains custom property name');
      assert.deepEqual(data[customPropertyName], expectedTokenData, 'Custom property contains correct token data');
      clearState(this.owner.application.jwt);
    });
  });
});
