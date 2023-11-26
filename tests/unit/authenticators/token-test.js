import { module, test } from 'qunit';
import sinon from 'sinon';
import startApp from '../../helpers/start-app';
import * as fetchWrapper from 'fetch';
import Token from '@triptyk/ember-simple-auth-token/authenticators/token';

let App;

const createFakeCredentials = () => {
  return {
    username: 'test@test.com',
    password: 'password'
  };
};

module('Token Authenticator', {
  beforeEach: () => {
    App = startApp();
    App.xhr = sinon.useFakeXMLHttpRequest();
    App.server = sinon.fakeServer.create();
    App.server.autoRespond = true;
    App.authenticator = Token.create();
    sinon.spy(fetchWrapper, 'default');
  }
});

test('#makeRequest successfully resolves with the correct data', assert => {
  assert.expect(1);

  const response = {
    'testing': '123'
  };
  const credentials = createFakeCredentials();

  App.server.respondWith('POST', '/endpoint', [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.makeRequest('/endpoint', credentials).then(data => {
    assert.deepEqual({
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

test('#makeRequest successfully rejects with the correct data on JSON error', assert => {
  assert.expect(1);

  const response = {
    'testing': '123'
  };
  const credentials = createFakeCredentials();

  App.server.respondWith('POST', '/endpoint', [
    403,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.makeRequest('/endpoint', credentials).catch(data => {
    assert.deepEqual({
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

test('#makeRequest successfully rejects with the correct data on HTML error', assert => {
  assert.expect(1);

  const response = '<h1>Error</h1>';
  const credentials = createFakeCredentials();

  App.server.respondWith('POST', '/endpoint', [
    403,
    {
      'Content-Type': 'text/html'
    },
    response
  ]);

  return App.authenticator.makeRequest('/endpoint', credentials).catch(data => {
    assert.deepEqual({
      statusText: 'Forbidden',
      status: 403,
      headers: {
        map: {
          'content-type': 'text/html'
        }
      },
      text: response
    }, JSON.parse(JSON.stringify(data)));
  });
});

test('#restore resolves with the correct data', assert => {
  assert.expect(1);

  const response = {
    [App.authenticator.tokenPropertyName]: 'secret token!'
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.restore(response).then(content => {
    assert.deepEqual(content, response);
  });
});

test('#authenticate sends a fetch request to the token endpoint', assert => {
  assert.expect(3);

  const response = {
    [App.authenticator.tokenPropertyName]: 'secret token!'
  };
  const credentials = createFakeCredentials();

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.authenticate(credentials).then(() => {
    assert.equal(fetchWrapper.default.callCount, 1);
    assert.equal(fetchWrapper.default.getCall(0).args[0], App.authenticator.serverTokenEndpoint);
    assert.deepEqual(fetchWrapper.default.getCall(0).args[1], {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  });
});

test('#authenticate successfully resolves with the correct data', assert => {
  assert.expect(1);

  const response = {
    [App.authenticator.tokenPropertyName]: 'secret token!'
  };
  const credentials = createFakeCredentials();

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.authenticate(credentials).then(data => {
    assert.deepEqual(data, response);
  });
});

test('#authenticate sends a fetch request to the token endpoint when `tokenPropertyName` is a nested object', assert => {
  assert.expect(3);

  App.authenticator.tokenPropertyName = 'auth.nested.token';

  const response = {
    [App.authenticator.tokenPropertyName]: 'secret token!'
  };
  const credentials = createFakeCredentials();

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.authenticate(credentials).then(() => {
    assert.equal(fetchWrapper.default.callCount, 1);
    assert.equal(fetchWrapper.default.getCall(0).args[0], App.authenticator.serverTokenEndpoint);
    assert.deepEqual(fetchWrapper.default.getCall(0).args[1], {
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
  assert.expect(3);

  const response = {
    [App.authenticator.tokenPropertyName]: 'secret token!'
  };
  const credentials = createFakeCredentials();

  App.authenticator.headers = {
    'X-API-KEY': '123-abc',
    'X-ANOTHER-HEADER': 0,
    'Accept': 'application/vnd.api+json'
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.authenticate(credentials).then(() => {
    assert.equal(fetchWrapper.default.callCount, 1);
    assert.equal(fetchWrapper.default.getCall(0).args[0], App.authenticator.serverTokenEndpoint);
    assert.deepEqual(fetchWrapper.default.getCall(0).args[1], {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: Object.assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, App.authenticator.headers)
    });
  });
});

test('#authenticate sends an fetch request with dynamic headers', assert => {
  assert.expect(3);

  const response = {
    [App.authenticator.tokenPropertyName]: 'secret token!'
  };
  const credentials = createFakeCredentials();

  const headers = {
    'X-API-KEY': '123-abc',
    'X-ANOTHER-HEADER': 0,
    'Accept': 'application/vnd.api+json'
  };

  App.server.respondWith('POST', App.authenticator.serverTokenEndpoint, [
    201,
    {
      'Content-Type': 'application/json'
    },
    JSON.stringify(response)
  ]);

  return App.authenticator.authenticate(credentials, headers).then(() => {
    assert.equal(fetchWrapper.default.callCount, 1);
    assert.equal(fetchWrapper.default.getCall(0).args[0], App.authenticator.serverTokenEndpoint);
    assert.deepEqual(fetchWrapper.default.getCall(0).args[1], {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: Object.assign({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, headers)
    });
  });
});

test('#authenticate rejects with the correct error', assert => {
  assert.expect(1);

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

test('#invalidate returns a resolving promise', assert => {
  assert.expect(1);

  return App.authenticator.invalidate().then(() => {
    assert.ok(true);
  });
});
