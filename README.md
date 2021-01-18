# Ember Simple Auth Token

[![travis-image]][travis]
[![ember-observer-image]][ember-observer]
[![npm-image]][npm]

This is Ember addon is an extension to the Ember Simple Auth library that provides a basic token authenticator, a JSON Web Tokens token authenticator with automatic refresh capability, and an authorizer mixin. You can find more about why JSON Web Tokens are so awesome in [this article][medium-jwt].

**Because user's credentials and tokens are exchanged between the Ember.js app and the server, you must use HTTPS for this connection!**

## Demo

A demo is available [here][demo].

## Installation

First, install the version of Ember Simple Auth that is compatible with your version of Ember. Ember Simple Auth Token is tested with Ember Simple Auth 1.6.0 up to the latest release of 3.0. Other versions beyond version 3.0 may work if Emper Simple Auth hasn't changed anything we use, but we do not guarantee this.

```bash
ember install ember-simple-auth
```

Then install Ember Simple Auth Token:

```bash
ember install ember-simple-auth-token
```

If using FastBoot, `ember-fetch` must be installed as a direct dependency and `node-fetch` must be added to your `fastbootDependencies`. If using FastBoot and the JWT authenticator, `node-fetch` and `buffer` must be added to you `fastbootDependencies`.

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
import Controller from '@ember/controller';
import { inject } from '@ember/service';

export default Controller.extend({
  session: inject('session'),

  actions: {
    authenticate: function() {
      const credentials = this.getProperties('username', 'password');
      const authenticator = 'authenticator:token'; // or 'authenticator:jwt'

      this.get('session').authenticate(authenticator, credentials);
    }
  }
});
```

#### JSON Web Token Authenticator

The JSON Web Token authenticator will decode the token and look for the expiration time found. The difference in the current time and the token expiration time is calculated. The `refreshLeeway` is subtracted from this value to determine when the automatic token refresh request should be made.

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

### Mixins

In order to send the token with all API requests made to the server, the `token-adapter` mixin or `token-authorizer` mixin should be used. When using `ember-simple-auth` >= 3.0.0, use the `token-adapter` mixin. When using `ember-simple-auth` < 3.0.0, use the `token-authorizer` mixin. The mixin will add the header to each API request:

```
Authorization: Bearer <token>
```

#### Adapter Mixin

```js
// app/adapters/application.js
import DS from 'ember-data';
import TokenAdapterMixin from 'ember-simple-auth-token/mixins/token-adapter';

export default DS.JSONAPIAdapter.extend(TokenAdapterMixin);
```

#### Authorizer Mixin

```js
// app/adapters/application.js
import DS from 'ember-data';
import TokenAuthorizerMixin from 'ember-simple-auth-token/mixins/token-authorizer';

export default DS.JSONAPIAdapter.extend(TokenAuthorizerMixin);
```

### Customization Options

#### Token Authenticator

```js
// config/environment.js
ENV['ember-simple-auth-token'] = {
  serverTokenEndpoint: '/api/token-auth/', // Server endpoint to send authenticate request
  tokenPropertyName: 'token', // Key in server response that contains the access token
  headers: {} // Headers to add to the
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
  refreshLeeway: 0 // Amount of time to send refresh request before token expiration
};
```

#### Token Authenticator

In addition to `tokenPropertyName` from the authenticator:

```js
// config/environment.js
ENV['ember-simple-auth-token'] = {
  authorizationHeaderName: 'Authorization', // Header name added to each API request
  authorizationPrefix: 'Bearer ', // Prefix added to each API request
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


[travis-image]: https://travis-ci.org/jpadilla/ember-simple-auth-token.svg?branch=master
[travis]: https://travis-ci.org/jpadilla/ember-simple-auth-token
[ember-observer-image]: https://emberobserver.com/badges/ember-simple-auth-token.svg
[ember-observer]: https://emberobserver.com/addons/ember-simple-auth-token
[npm-image]: https://img.shields.io/npm/v/ember-simple-auth-token.svg
[npm]: https://www.npmjs.com/package/ember-simple-auth-token

[demo]: https://jpadilla.github.io/ember-simple-auth-token
[ember-cli]: https://ember-cli.com
[ember-simple-auth]: https://github.com/simplabs/ember-simple-auth
[pyjwt]: https://github.com/jpadilla/pyjwt
[ruby-jwt]: https://github.com/jwt/ruby-jwt
[node-jsonwebtoken]: https://github.com/auth0/node-jsonwebtoken
[jwt]: https://jwt.io
[medium-jwt]: https://medium.com/@leo/why-json-web-tokens-are-truly-awesome-23fb80b7fc20
[blog-refresh-token]: https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them
