import { module, test } from 'qunit';
import { setupTest } from 'test-app/tests/helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Unit | Authenticator | authenticators/token.js', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.owner.application.token = this.owner.lookup('authenticator:token');
  });

  const createFakeCredentials = () => {
    return {
      username: 'admin',
      password: 'abc123'
    };
  };

  test('token exists', function (assert) {
    assert.expect(1);
    const token = this.owner.lookup('authenticator:token');
    assert.ok(token);
  });

  test('#makeRequest successfully resolves with the correct data', function(assert) {
    assert.expect(1);

    const response = {
      'testing': '123'
    };
    const credentials = createFakeCredentials();

    this.server.post('/endpoint', () => ({
      ...response
    }), 201);

    this.owner.application.token.makeRequest('http://localhost:8080/api/endpoint', credentials).then(data => {
      assert.propEqual({
        statusText: 'Created',
        status: 201,
        headers: {
          map: {
            'content-type': 'application/json'
          }
        },
        text: JSON.stringify(response),
        json: response
      }, JSON.parse(JSON.stringify(data)));
    });
  });

  test('#makeRequest successfully rejects with the correct data on JSON error', function(assert) {
    assert.expect(1);

    const response = {
      'testing': '123'
    };
    const credentials = createFakeCredentials();

    this.server.post('/endpoint', () => ({
      ...response
    }), 403);

    this.owner.application.token.makeRequest('http://localhost:8080/api/endpoint', credentials).catch(data => {
      assert.propEqual({
        statusText: 'Forbidden',
        status: 403,
        headers: {
          map: {
            'content-type': 'application/json'
          }
        },
        text: JSON.stringify(response),
        json: response
      }, JSON.parse(JSON.stringify(data)));
    });
  });

  test('#makeRequest successfully rejects with the correct data on HTML error', function(assert) {
    assert.expect(1);

    const response = '<h1>Error</h1>';
    const credentials = createFakeCredentials();

    this.server.post('/endpoint', () => ({
      response
    }), 403);

    this.owner.application.token.makeRequest('http://localhost:8080/api/endpoint', credentials).catch(data => {
      delete data.headers.append;
      assert.propEqual(data, {
        statusText: 'Forbidden',
        status: 403,
        headers: {
          'map': {
            'content-type': 'application/json'
          }
        },
        json: {
          response: response
        },
        text: "{\"response\":\"<h1>Error</h1>\"}"
      });
    });
  });

  test('#restore resolves with the correct data', function(assert) {
    assert.expect(1);

    const response = {
      token: 'secret token!'
    };

    this.server.post('/token-auth', () => ({
      ...response
    }), 201);

    this.owner.application.token.restore(response).then(content => {
      assert.propEqual(content, response);
    });
  });

  test('#authenticate sends a fetch request to the token endpoint', function(assert) {
    assert.expect(4);

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

    this.owner.application.token.authenticate(credentials);
  });

  test('#authenticate successfully resolves with the correct data', function(assert) {
    assert.expect(1);

    const response = {
      token: 'secret token!'
    };
    const credentials = createFakeCredentials();

    this.server.post('/token-auth', () => ({
      ...response
    }), 201);

    this.owner.application.token.authenticate(credentials).then(data => {
      assert.propEqual(data, response);
    });
  });

  test('#authenticate sends a fetch request to the token endpoint when `tokenPropertyName` is a nested object', function(assert) {
    assert.expect(4);

    this.owner.application.token.tokenPropertyName = 'auth.nested.token';

    const response = {
      token: 'secret token!'
    };
    const credentials = createFakeCredentials();

    this.server.post('/token-auth', () => ({
      ...response
    }), 201);

    this.server.pretender.handledRequest = (verb, path, request) => {
      assert.strictEqual(path, 'http://localhost:8080/api/token-auth');
      assert.strictEqual(verb, 'POST');
      assert.strictEqual(request.requestBody, JSON.stringify(credentials));
      assert.strictEqual(JSON.stringify(request.requestHeaders), JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }));
    };

    this.owner.application.token.authenticate(credentials);
  });

  test('#authenticate sends an fetch request with custom headers', function(assert) {
    assert.expect(4);

    const credentials = createFakeCredentials();

    this.owner.application.token.headers = {
      'X-API-KEY': '123-abc',
      'X-ANOTHER-HEADER': 0,
      'Accept': 'application/json'
    };

    this.server.pretender.handledRequest = (verb, path, request) => {
      assert.strictEqual(path, 'http://localhost:8080/api/token-auth');
      assert.strictEqual(verb, 'POST');
      assert.strictEqual(request.requestBody, JSON.stringify(credentials));
      assert.strictEqual(JSON.stringify(request.requestHeaders), JSON.stringify({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-API-KEY': '123-abc',
        'X-ANOTHER-HEADER': '0'
      }));
    };

    this.owner.application.token.authenticate(credentials);
  });

  test('#authenticate sends an fetch request with dynamic headers', function(assert) {
    assert.expect(4);

    const credentials = createFakeCredentials();

    const headers = {
      'X-API-KEY': '123-abc',
      'X-ANOTHER-HEADER': 0,
      'Accept': 'application/json'
    };

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

    this.owner.application.token.authenticate(credentials, headers);
  });

  test('#authenticate rejects with the correct error', function(assert) {
    assert.expect(1);

    this.owner.application.token.authenticate({username: 'admin', password: 'incorrectPassword'}).catch(error => {
      assert.strictEqual(error.status, 401);
    });
  });

  test('#invalidate returns a resolving promise', function(assert) {
    assert.expect(1);

    this.owner.application.token.invalidate().then(() => {
      assert.ok(true);
    });
  });
});
