/* eslint-disable qunit/require-expect */
import { module, test } from 'qunit';
import sinon from 'sinon';
import startApp from '../../helpers/start-app';
import Token from '@triptyk/ember-simple-auth-token/authenticators/token';
import { http, HttpResponse } from 'msw';
import { setupWorker } from 'msw/browser';

const createFakeCredentials = () => {
  return {
    username: 'test@test.com',
    password: 'password',
  };
};

module('Token Authenticator', (hooks) => {
  let App;
  let fetch;
  let server;

  hooks.beforeEach(() => {
    App = startApp();
    App.authenticator = Token.create();
    fetch = sinon.spy(window, 'fetch');
  });

  hooks.afterEach(() => {
    fetch.restore();
    if (server) {
      server.resetHandlers();
      server.stop();
      server = undefined;
    }
  });

  function startMockServer(method, url, [status, headers, response]) {
    const handler = http[method.toLowerCase()](url, () => {
      if (headers['Content-Type'] === 'text/html') {
        return new HttpResponse(response, {
          status,
          headers,
        });
      }

      return HttpResponse.json(JSON.parse(response), {
        status,
        headers,
      });
    });

    if (server) {
      return server.use(handler);
    }
    server = setupWorker(handler);

    return server.start();
  }

  test('#makeRequest successfully resolves with the correct data', async (assert) => {
    assert.expect(1);

    const response = {
      testing: '123',
    };
    const credentials = createFakeCredentials();

    await startMockServer('POST', '/endpoint', [
      201,
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify(response),
    ]);

    await App.authenticator
      .makeRequest('/endpoint', credentials)
      .then((data) => {
        assert.deepEqual(JSON.parse(JSON.stringify(data)), {
          statusText: 'Created',
          status: 201,
          headers: {},
          text: JSON.stringify(response),
          json: response,
        });
      });
  });

  test('#makeRequest successfully rejects with the correct data on JSON error', async (assert) => {
    assert.expect(1);

    const response = {
      testing: '123',
    };
    const credentials = createFakeCredentials();

    await startMockServer('POST', '/endpoint', [
      403,
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify(response),
    ]);

    return App.authenticator
      .makeRequest('/endpoint', credentials)
      .catch((data) => {
        assert.deepEqual(
          {
            statusText: 'Forbidden',
            status: 403,
            headers: {},
            text: JSON.stringify(response),
            json: response,
          },
          JSON.parse(JSON.stringify(data)),
        );
      });
  });

  test('#makeRequest successfully rejects with the correct data on HTML error', async (assert) => {
    assert.expect(1);

    const response = '<h1>Error</h1>';
    const credentials = createFakeCredentials();

    await startMockServer('POST', '/endpoint', [
      403,
      {
        'Content-Type': 'text/html',
      },
      response,
    ]);

    return App.authenticator
      .makeRequest('/endpoint', credentials)
      .catch((data) => {
        assert.deepEqual(
          {
            statusText: 'Forbidden',
            status: 403,
            headers: {},
            text: response,
          },
          JSON.parse(JSON.stringify(data)),
        );
      });
  });

  test('#restore resolves with the correct data', async (assert) => {
    assert.expect(1);

    const response = {
      [App.authenticator.tokenPropertyName]: 'secret token!',
    };

    await startMockServer('POST', App.authenticator.serverTokenEndpoint, [
      201,
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify(response),
    ]);

    return App.authenticator.restore(response).then((content) => {
      assert.deepEqual(content, response);
    });
  });

  test('#authenticate sends a fetch request to the token endpoint', async (assert) => {
    assert.expect(3);

    const response = {
      [App.authenticator.tokenPropertyName]: 'secret token!',
    };
    const credentials = createFakeCredentials();

    await startMockServer('POST', App.authenticator.serverTokenEndpoint, [
      201,
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify(response),
    ]);

    return App.authenticator.authenticate(credentials).then(() => {
      assert.deepEqual(fetch.callCount, 1);
      assert.deepEqual(
        fetch.getCall(0).args[0],
        App.authenticator.serverTokenEndpoint,
      );
      assert.deepEqual(fetch.getCall(0).args[1], {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
    });
  });

  test('#authenticate successfully resolves with the correct data', async (assert) => {
    assert.expect(1);

    const response = {
      [App.authenticator.tokenPropertyName]: 'secret token!',
    };
    const credentials = createFakeCredentials();

    await startMockServer('POST', App.authenticator.serverTokenEndpoint, [
      201,
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify(response),
    ]);

    return App.authenticator.authenticate(credentials).then((data) => {
      assert.deepEqual(data, response);
    });
  });

  test('#authenticate sends a fetch request to the token endpoint when `tokenPropertyName` is a nested object', async (assert) => {
    assert.expect(3);

    App.authenticator.tokenPropertyName = 'auth.nested.token';

    const response = {
      [App.authenticator.tokenPropertyName]: 'secret token!',
    };
    const credentials = createFakeCredentials();

    await startMockServer('POST', App.authenticator.serverTokenEndpoint, [
      201,
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify(response),
    ]);

    return App.authenticator.authenticate(credentials).then(() => {
      assert.deepEqual(fetch.callCount, 1);
      assert.deepEqual(
        fetch.getCall(0).args[0],
        App.authenticator.serverTokenEndpoint,
      );
      assert.deepEqual(fetch.getCall(0).args[1], {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
    });
  });

  test('#authenticate sends an fetch request with custom headers', async (assert) => {
    assert.expect(3);

    const response = {
      [App.authenticator.tokenPropertyName]: 'secret token!',
    };
    const credentials = createFakeCredentials();

    App.authenticator.headers = {
      'X-API-KEY': '123-abc',
      'X-ANOTHER-HEADER': 0,
      Accept: 'application/vnd.api+json',
    };

    await startMockServer('POST', App.authenticator.serverTokenEndpoint, [
      201,
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify(response),
    ]);

    return App.authenticator.authenticate(credentials).then(() => {
      assert.deepEqual(fetch.callCount, 1);
      assert.deepEqual(
        fetch.getCall(0).args[0],
        App.authenticator.serverTokenEndpoint,
      );
      assert.deepEqual(fetch.getCall(0).args[1], {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: Object.assign(
          {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          App.authenticator.headers,
        ),
      });
    });
  });

  test('#authenticate sends an fetch request with dynamic headers', async (assert) => {
    assert.expect(3);

    const response = {
      [App.authenticator.tokenPropertyName]: 'secret token!',
    };
    const credentials = createFakeCredentials();

    const headers = {
      'X-API-KEY': '123-abc',
      'X-ANOTHER-HEADER': 0,
      Accept: 'application/vnd.api+json',
    };

    await startMockServer('POST', App.authenticator.serverTokenEndpoint, [
      201,
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify(response),
    ]);

    return App.authenticator.authenticate(credentials, headers).then(() => {
      assert.deepEqual(fetch.callCount, 1);
      assert.deepEqual(
        fetch.getCall(0).args[0],
        App.authenticator.serverTokenEndpoint,
      );
      assert.deepEqual(fetch.getCall(0).args[1], {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: Object.assign(
          {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          headers,
        ),
      });
    });
  });

  test('#authenticate rejects with the correct error', async (assert) => {
    assert.expect(1);

    const credentials = createFakeCredentials();

    await startMockServer('POST', App.authenticator.serverTokenEndpoint, [
      400,
      {
        'Content-Type': 'application/json',
      },
      JSON.stringify({}),
    ]);

    return App.authenticator.authenticate(credentials).catch((error) => {
      assert.deepEqual(error.status, 400);
    });
  });

  test('#invalidate returns a resolving promise', (assert) => {
    assert.expect(1);

    return App.authenticator.invalidate().then(() => {
      assert.ok(true);
    });
  });
});
