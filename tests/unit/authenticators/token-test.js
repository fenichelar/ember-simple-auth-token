import { module } from 'qunit';
import { test } from 'ember-qunit';
import sinon from 'sinon';
import startApp from '../../helpers/start-app';
import * as fetchWrapper from 'fetch';
import { run } from '@ember/runloop';
import { merge } from '@ember/polyfills';
import Token from 'ember-simple-auth-token/authenticators/token';

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
  },
  afterEach: () => {
    run(App, App.destroy);
    App.xhr.restore();
    fetchWrapper.default.restore();
  }
});

test('#restore resolves with the correct data', assert => {
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
  assert.expect(2);

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

test('#authenticate successfully resolves with the correct data', assert => {
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
  assert.expect(2);

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
    const args = fetchWrapper.default.getCall(0).args;
    assert.equal(args[0], App.authenticator.serverTokenEndpoint);
    assert.deepEqual(args[1], {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: merge({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, App.authenticator.headers)
    });
  });
});

test('#authenticate sends an fetch request with dynamic headers', assert => {
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
    const args = fetchWrapper.default.getCall(0).args;
    assert.equal(args[0], App.authenticator.serverTokenEndpoint);
    assert.deepEqual(args[1], {
      method: 'POST',
      body: JSON.stringify(credentials),
      headers: merge({
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

test('#invalidate returns a resolving promise', assert => {
  return App.authenticator.invalidate().then(() => {
    assert.ok(true);
  });
});
