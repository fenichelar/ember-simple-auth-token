# ember-simple-auth-token

[![github-actions-image]][github-actions]
[![ember-observer-image]][ember-observer]
[![npm-image]][npm]

This is Ember addon is an extension to the Ember Simple Auth library that provides a basic token authenticator, a JSON Web Tokens token authenticator with automatic refresh capability. You can find more about why JSON Web Tokens are so awesome in [this article][medium-jwt].

**Because user's credentials and tokens are exchanged between the Ember.js app and the server, you must use HTTPS for this connection!**

## Compatibility

- Ember.js 4.8 or above
- Ember CLI 4.8 or above
- Node.js 18 or above
- ember-simple-auth 6 or above

## Demo

A demo is available [here][demo].

## Installation

Ember Simple Auth Token can be installed with [Ember CLI][ember-cli] by running:

```
ember install ember-simple-auth-token
ember install ember-simple-auth
```

## Setup

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
<form {{action 'authenticate' on='submit'}}>
  <label for="username">Login</label>
  {{input id='username' placeholder='Enter Login' value=username}}
  <label for="password">Password</label>
  {{input id='password' placeholder='Enter Password' type='password' value=password}}
  <button type="submit">Login</button>
</form>
```

```js
// app/controllers/login.js
export default class LoginController extends Controller {
  @service session;
  username = 'admin';
  password = 'abc123';

  @action
  authenticate() {
    const credentials = { username: this.username, password: this.password };
    const authenticator = 'authenticator:jwt';

    this.session.authenticate(authenticator, credentials);
  }
}
```

#### JSON Web Token Authenticator

The JSON Web Token authenticator will decode the token and look for the expiration time. The difference in the current time and the token expiration time is calculated. The `refreshLeeway` is subtracted from this value to determine when the automatic token refresh request should be made.

```js
// config/environment.js
ENV['ember-simple-auth-token'] = {
  refreshAccessTokens: true,
  refreshLeeway: 300 // refresh 5 minutes (300 seconds) before expiration
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
import { computed } from '@ember/object';

export default class ApplicationAdapter extends JSONAPIAdapter {
  @service declare session;

  get headers() {
    const headers = {
      Authorization: '',
    };
    if (this.session.isAuthenticated) {
      headers['Authorization'] =
        `Bearer ${this.session.data.authenticated.accessToken}`;
    }
    return headers;
  }

  handleResponse(status, headers, payload, requestData) {
    if (status === 401 && this.session.isAuthenticated) {
      this.session.invalidate();
    }
    return super.handleResponse(status, headers, payload, requestData);
  },
};
```

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

## Testing Configuration

For acceptance testing, token refresh must be disabled to allow the test to exit. Therefore, the following configuration should be set:

```js
// config/environment.js
ENV['ember-simple-auth-token'] = {
  refreshAccessTokens: false,
  tokenExpirationInvalidateSession: false,
};
```

## Upgrade Notes

- `getResponseData`, `getAuthenticateData`, `config.identificationField`, and `config.passwordField` have been removed since version 4.0.0
- `config.timeFactor` has been removed since version 2.1.0


[github-actions-image]: https://github.com/fenichelar/@triptyk/ember-simple-auth-token/actions/workflows/test.yml/badge.svg
[github-actions]: https://github.com/fenichelar/@triptyk/ember-simple-auth-token/actions/workflows/test.yml
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
[medium-jwt]: https://medium.com/@leo/why-json-web-tokens-are-truly-awesome-23fb80b7fc20
[blog-refresh-token]: https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them
