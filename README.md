# Ember Simple Auth Token

[![github-actions-image]][github-actions]
[![ember-observer-image]][ember-observer]
[![npm-image]][npm]

This Ember addon is an extension of the Ember Simple Auth library which provides a basic token authenticator and a JSON Web Tokens (jwt) token authenticator with automatic refresh capability. You can find more about why JSON Web Tokens are so awesome in [this blog](https://medium.com/@extio/understanding-json-web-tokens-jwt-a-secure-approach-to-web-authentication-f551e8d66deb) and [here as well](https://medium.com/swlh/all-you-need-to-know-about-json-web-token-jwt-8a5d6131157f).

**Because users' credentials and tokens are exchanged between the Ember.js app and the server, you must use HTTPS for this connection!**

## Demo

A demo is available [here][demo]. The test-app has an example of implementing jwt with auto-refresh. It can be run by cloning the repo, then:

```node
cd ember-simple-auth-token
npm i
npm start // express server
// or
npm run mirage // mirage api mock
// navigate to http://localhost:4201
```

## Compatibility

`ember-simple-auth-token` v6 is compatible with node >= 18, `ember-simple-auth` 6 and Ember 5 with Embroider (Ember build pipeline), `ember-auto-import` >= 2 (dependency manager) and `webpack` >= 5 (module bundler). npm is the supported package manager.

## Installation

Ember Simple Auth Token can be installed with [Ember CLI][ember-cli] by running:

```
ember install ember-simple-auth-token
```

`ember-simple-auth-token` will automatically install a compatible version of `ember-simple-auth`. If you want to manually install `ember-simple-auth`, you must ensure to install a version that is supported by `ember-simple-auth-token`.

## Setup

### Calling session.setup() on ember-simple-auth session service

`ember-simple-auth` v6 no longer uses an initializer to wire up the session service. Your applicaton must implement an application router to call .setup() on the `ember-simple-auth` session service:

```js
// app/routes/application.js
import Route from '@ember/routing/route';
import { inject } from '@ember/service';

export default class ApplicationRoute extends Route {
  @inject session;

  async beforeModel() {
    await this.session.setup();
  }
}
```

### Routing

It is [recommended by](https://github.com/mainmatter/ember-simple-auth) `ember-simple-auth` to use an authenticated route in your application, placing all secure routes under it, and employing `session.requireAuthentication()` in `beforeModel`.

```javascript
// app/router.js
import EmberRouter from '@ember/routing/router';
import config from 'test-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
  this.route('authenticated', { path: '' }, function() {
    // all routes that require the session to be authenticated
    this.route('index', { path: '' });
    this.route('secure');
  });
});

// app/routes/authenticated.js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
```

Leaving `path: ''` in your router for the authenticated root will keep all secure roots at the top-level, without an extra added path segment. You can also use a path, such as `path: 'application'`, etc. to separate the secured routes from non-secured routes in your URL structure. EG: `myapp/application/secure` and `myapp/login`.

All authenticated routes can then inherit the authenticated route:

```javascript
// app/routes/authenticated/secure.js
import Route from '../authenticated';

export default class SecureRoute extends Route {}
```

Your project's folder structure would look like this:

```
project
│
└───app
    │   router.js
    │
    └───routes
        │   application.js
        │   authenticated.js
        │   login.js
        │
        └───authenticated
                secure.js
                index.js
```

Make sure `ember-simple-auth` is configured to utilize this route structure in your environment file:

```javascript
// config/environment.js
ENV['ember-simple-auth'] = {
  routeAfterAuthentication: 'authenticated.index',
  routeAfterInvalidation: 'login',
};
```

### Authenticator

In order to use the token authenticator or the JSON Web Token authenticator, the application should have a route for login. In most cases, the login route will display a form with a `username` and `password` field. On form submit, the `authenticate` action will be called on the `session`:

```js
// app/router.js
Router.map(function() {
  this.route('login');
});
```

```html
{{! app/templates/login.hbs }}
<form {{on "submit" this.authenticate}}>
  <label for="username">Login</label>
  {{input id='username' placeholder='Enter Login' value=username}}
  <label for="password">Password</label>
  {{input id='password' placeholder='Enter Password' type='password' value=password}}
  <button type="submit">Login</button>
</form>
```

```js
// app/controllers/login.js
import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class LoginController extends Controller {
  @service session;
  @service router;
  username = 'admin';
  password = 'abc123';

  @action
  async authenticate(e) {
    e.preventDefault();
    e.stopPropagation();
    const authenticator = 'authenticator:jwt'; // or 'authenticator:token'
    this.session.authenticate(authenticator, {username: this.username, password: this.password}).catch((err) => {
      if (err.status === 401) {
        alert('Incorrect username or password');
        return;
      }
      let errorMessage = '';
      if (err.text) {
        try {
          if (this.isJsonResponse(err.text)) {
            errorMessage = JSON.parse(err.text).errors[0].message;
          } else {
            errorMessage = err.text;
          }
        } catch(er) {
          alert('An unexpected error occured. ' + er.toString());
        }
      } else {
        errorMessage = err;
      }
      alert(errorMessage);
    });
  }

  isJsonResponse(response) {
    if (typeof response !== 'string') return false;
    try {
      const result = JSON.parse(response);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]' || type === '[object Array]';
    } catch (err) {
      return false;
    }
  }
}

```

#### JSON Web Token Authenticator

The JSON Web Token authenticator will decode the token and look for the expiration time. The difference in the current time and the token expiration time is calculated. The `refreshLeeway` is subtracted from this value to determine when the automatic token refresh request should be made.

```js
// config/environment.js
ENV['ember-simple-auth-token'] = {
  refreshAccessTokens: true,
  refreshLeeway: 300 // refresh 5 minutes (300 seconds) before expiration; if undefined, will default to .05 (3 seconds)
};
```

The `refreshLeeway` can be specified to send the requests before the token expires to account for clock skew. Some libraries like [PyJWT][pyjwt], [ruby-jwt][ruby-jwt], and [node-jsonwebtoken][node-jsonwebtoken] also support specifying a clock tolerance when verifying the token.

Sample JSON Web Token:

```js
const encodedToken = eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImpvaG4iLCJleHAiOjk4MzQzMjM0fQ.FKuPdB7vmkRfR2fqaWEyltlgOt57lYQ2vC_vFXtlMMJfpCMMq0BEoXEC6rLC5ygORcKHprupi06Zmx0D8nChPQ;
const decodedHeader = {
  'alg': 'HS512',
  'typ': 'JWT'
};
const decodedPayload = {
  'username': 'john',
  'exp': 98343234 // <ISO-8601> UTC seconds
};
```

To debug JSON Web Token issues, see [jwt][jwt].

The JSON Web Token authenticator supports both separate access tokens and refresh tokens. By specifying the `tokenPropertyName` and the `refreshTokenPropertyName` to the same value, the same token will be used for both access and refresh requests. For more information about refresh tokens, see [this blog][blog-refresh-token].

#### Adapter

In order to send the token with all API requests made to the server, set the headers object in the adapter:

```js
// app/adapters/application.js
import JSONAPIAdapter from '@ember-data/adapter/json-api';
import { service } from '@ember/service';

export default class ApplicationAdapter extends JSONAPIAdapter {
  namespace = 'api';

  @service session;

  get headers() {
    if (this.session.isAuthenticated) {
      return {
        Authorization: `Bearer ${this.session.data.authenticated.token}`,
      };
    } else {
      return {};
    }
  }

  handleResponse(status) {
    if (status === 401 && this.session.isAuthenticated) {
      this.session.invalidate();
    }
  }
}
```

### Mixins

Mixin support has been removed from `ember-simple-auth` v6. Mixins are therefore no longer supported in `ember-simple-auth-token`. If you need mixin support, please use the pre Ember 5, non Embroider version of `ember-simple-auth-token`.

### Customization Options

#### Token Authenticator

```js
// config/environment.js
ENV['ember-simple-auth-token'] = {
  serverTokenEndpoint: '/api/token-auth/', // Server endpoint to send authenticate request
  tokenPropertyName: 'token', // Key in server response that contains the access token
  headers: {} // Headers to add to the authenticate request
};
```

#### JSON Web Token Authenticator

In addition to all the customization options available to the token authenticator:

```js
// config/environment.js
ENV['ember-simple-auth-token'] = {
  tokenDataPropertyName: 'tokenData', // Key in session to store token data
  refreshAccessTokens: true, // Enables access token refreshing
  tokenExpirationInvalidateSession: true, // Enables session invalidation on token expiration
  serverTokenRefreshEndpoint: '/api/token-refresh/', // Server endpoint to send refresh request
  refreshTokenPropertyName: 'refresh_token', // Key in server response that contains the refresh token
  tokenExpireName: 'exp', // Field containing token expiration
  refreshLeeway: 0, // Amount of time in seconds to send refresh request before token expiration
  tokenRefreshInvalidateSessionResponseCodes: [401, 403], // Array of response codes that cause an immediate session invalidation if received when attempting to refresh the token
  refreshAccessTokenRetryAttempts: 0, // Number of token retry attempts to make
  refreshAccessTokenRetryTimeout: 1000, // Amount of time in milliseconds to wait between token refresh retry attempts
  tokenRefreshFailInvalidateSession: false // Enables session invalidation if all token refresh retry requests fail
};
```

## mirage

The test-app now uses mirage.js via [ember-cli-mirage](https://github.com/miragejs/ember-cli-mirage) to simulate a server response to the `/token-auth` and `/token-refresh` api endpoints. Run the test-app with mirage support (`ember s --environment=mirage`) from within the cloned repo:

```node
cd ember-simple-auth-token
npm run mirage
```

Launching the test-app with `npm run mirage` will prevent the express server from running. The mirage mock server runs in test mode (`ember s --environment=test`) simply because the api responses are logged in the browser console and can more easily be inspected. If using FastBoot in the cloned repo, the mirage api mock will not run. You must instead use the express server via `npm start`.

## express server

The test-app also ships with an express server which is run with `ember s --environment=development` from within the cloned repo:

```node
cd ember-simple-auth-token
npm start
```

Launching the test-app with `npm start` will prevent the mirage api mock from running.

Both mirage and express have a `/api/helloworld` GET endpoint to verify the backend service is running. A call to this endpoint is commented out in `test-app/app/routes/application.js`.

## Testing Configuration

For acceptance testing, token refresh must be disabled to allow the test to exit. Therefore, the following configuration should be set:

```js
// config/environment.js
ENV['ember-simple-auth-token'] = {
  refreshAccessTokens: false,
  tokenExpirationInvalidateSession: false,
};
```

If your tests are still timing out due to a setTimeout(), you can manually end the timers used in `ember-simple-auth-token` at the end of each of your tests:

```javascript
import { module, test } from 'qunit';
import { setupTest } from 'test-app/tests/helpers';
import { getSettledState } from '@ember/test-helpers';

module('Unit | Authenticator | authenticators/jwt.js', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function() {
    this.owner.application.jwt = this.owner.lookup('authenticator:jwt');
  });

  const clearState = (jwt) => {
    let state = getSettledState();
    if (state.hasPendingTimers || state.hasRunLoop) {
      jwt.cancelAllTimers();
    }
  };

  test('your test message`', function(assert) {
    assert.expect(1);
    // ... tests
    clearState(this.owner.application.jwt);
  });
});
```

## Running tests in a cloned repo

ember-cli / qunit tests can be run via the command line from within the cloned repo:

```node
cd ember-simple-auth-token
npm run test
```

Tests can also be run in the browser, which will refresh and rerun all tests after any change to a unit test:

```node
cd ember-simple-auth-token
npm run mirage
// visit http://localhost:4201/tests
```

## Upgrade Notes

Version 6:

- mixins are no longer supported by the 6.0 version of `ember-simple-auth-token`

- `ember-simple-auth` v6 requires calling `session.setup()` in your app's `routes/application.js`

- if `refreshLeeway` is not set in your app's `config/environment.js`, it will default to 0.05 (3 seconds). This will help prevent a race condition where `handleAccessTokenExpiration()` could be called before `refreshAccessToken()` completes, logging the user out. You can set `refreshLeeway: 0` in your `config/environment.js`, but this may cause the user to be logged out even if `refreshAccessTokens = true`.

Previous versions:

- `getResponseData`, `getAuthenticateData`, `config.identificationField`, and `config.passwordField` have been removed since version 4.0.0
- `config.timeFactor` has been removed since version 2.1.0


[github-actions-image]: https://github.com/fenichelar/ember-simple-auth-token/actions/workflows/test.yml/badge.svg
[github-actions]: https://github.com/fenichelar/ember-simple-auth-token/actions/workflows/test.yml
[ember-observer-image]: https://emberobserver.com/badges/ember-simple-auth-token.svg
[ember-observer]: https://emberobserver.com/addons/ember-simple-auth-token
[npm-image]: https://img.shields.io/npm/v/ember-simple-auth-token.svg
[npm]: https://www.npmjs.com/package/ember-simple-auth-token

[demo]: https://fenichelar.github.io/ember-simple-auth-token
[ember-cli]: https://ember-cli.com
[ember-simple-auth]: https://github.com/simplabs/ember-simple-auth
[pyjwt]: https://github.com/jpadilla/pyjwt
[ruby-jwt]: https://github.com/jwt/ruby-jwt
[node-jsonwebtoken]: https://github.com/auth0/node-jsonwebtoken
[jwt]: https://jwt.io
[blog-refresh-token]: https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them
