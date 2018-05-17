import { module } from 'qunit';
import { test } from 'ember-qunit';
import sinon from 'sinon';
import startApp from '../../helpers/start-app';
import $ from 'jquery';
import { run } from '@ember/runloop';
import Token from 'ember-simple-auth-token/authenticators/token';

var App;

module('Token Authenticator', {
  beforeEach: () => {
    App = startApp();
    App.xhr = sinon.useFakeXMLHttpRequest();
    App.server = sinon.fakeServer.create();
    App.server.autoRespond = true;
    App.authenticator = Token.create();
    sinon.spy($, 'ajax');
  },
  afterEach: () => {
    run(App, App.destroy);
    App.xhr.restore();
    $.ajax.restore();
  }
});

test('#restore resolves with the correct data', assert => {
  const properties = {
    token: 'secret token!'
  };

  App.server.respondWith('POST', '/api/token-auth/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "token": "secret token!" }'
  ]);

  run(() => {
    App.authenticator.restore(properties).then(content => {
      assert.deepEqual(content, properties);
    });
  });
});

test('#authenticate sends an AJAX request to the sign in endpoint', assert => {
  const credentials = {
    username: 'test@test.com',
    password: 'password'
  };

  App.authenticator.authenticate(credentials);

  run(() => {
    var args = $.ajax.getCall(0).args[0];
    delete args.beforeSend;
    assert.deepEqual(args, {
      url: '/api/token-auth/',
      method: 'POST',
      data: '{"username":"test@test.com","password":"password"}',
      dataType: 'json',
      contentType: 'application/json',
      headers: {}
    });
  });
});

test('#authenticate successfully resolves with the correct data', assert => {
  const credentials = {
    username: 'test@test.com',
    password: 'password'
  };

  App.server.respondWith('POST', '/api/token-auth/', [
    201, {
      'Content-Type': 'application/json'
    },
    '{ "access_token": "secret token!" }'
  ]);

  return App.authenticator
    .authenticate(credentials)
    .then(data => {
      assert.deepEqual(data, { access_token: 'secret token!' });
    }
  );
});

test('#authenticate sends an AJAX request with custom headers', assert => {
  const credentials = {
    username: 'test@test.com',
    password: 'password'
  };

  App.authenticator = Token.create();

  App.authenticator.headers = {
    'X-API-KEY': '123-abc',
    'X-ANOTHER-HEADER': 0,
    Accept: 'application/vnd.api+json'
  };

  App.authenticator.authenticate(credentials);

  run(() => {
    var args = $.ajax.getCall(0).args[0];
    delete args.beforeSend;
    assert.deepEqual(args, {
      url: '/api/token-auth/',
      method: 'POST',
      data: '{"username":"test@test.com","password":"password"}',
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

test('#authenticate rejects with the correct error', assert => {
  const done = assert.async();

  const credentials = {
    username: 'test@test.com',
    password: 'password'
  };

  App.server.respondWith('POST', '/api/token-auth/', [
    400, {
      'Content-Type': 'application/json'
    },
    '{ "error": "invalid_grant" }'
  ]);

  App.authenticator.authenticate(credentials).then(null, error => {
    assert.deepEqual(error, { error: 'invalid_grant' });
    done();
  });
});

test('#invalidate returns a resolving promise', assert => {
  App.authenticator.invalidate().then(() => {
    assert.ok(true);
  });
});
