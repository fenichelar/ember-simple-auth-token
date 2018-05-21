# Ember Simple Auth Token

[![travis-image]][travis]
[![ember-observer-image]][ember-observer]
[![npm-image]][npm]

This is Ember addon is an extension to the Ember Simple Auth library that provides a basic token authenticator, a JSON Web Tokens token authenticator with automatic refresh capability, and an authorizer mixin. You can find more about why JSON Web Tokens are so awesome in [this article][medium-jwt].

**Because user's credentials and tokens are exchanged between the
Ember.js app and the server, you must use HTTPS for this connection!**

## Demo

A demo is available [here][demo].

## Installation

Before installing the Ember Simple Auth Token addon, [ember-simple-auth][ember-simple-auth] must be installed. Both addons can be installed with [Ember CLI][ember-cli] by running:

```
ember install ember-simple-auth
ember install ember-simple-auth-token
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
import Controller from '@ember/controller';
import { inject } from '@ember/service';

export default Controller.extend({
  session: inject('session'),

  actions: {
    authenticate: function() {
      var credentials = this.getProperties('username', 'password');
      const authenticator = 'authenticator:token'; // or 'authenticator:jwt'

      this.get('session').authenticate(authenticator, credentials);
    }
  }
});
```

#### JSON Web Token Authenticator

The JSON Web Token authenticator will decode the token and look for the
expiration time found. The difference in the current time and the token expiration time is calculated. The `refreshLeeway` is subtracted from this value to determine when the automatic token refresh request should be made.

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

The JSON Web Token authenticator supports both separate access tokens and refresh tokens. By specifying the `tokenPropertyName` and the `refreshTokenPropertyName` to the same value, the same token will be used for both access and refresh requests. For more information about refresh tokens, see [this blog](blog-refresh-token).

### Authorizer Mixin

In order to send the token with all API requests made to the server, the token authorizer mixin should be used:

```js
// app/adapters/application.js
import DS from 'ember-data';
import TokenAuthorizerMixin from 'ember-simple-auth-token/mixins/token-authorizer';

export default DS.JSONAPIAdapter.extend(TokenAuthorizerMixin);
```

The mixin will add the header to each API request:

```
Authorization: Bearer <token>
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

### JSON Web Token Authenticator

In addition to all the customization options available to the token authenticator:

```js
// config/environment.js
ENV['ember-simple-auth-token'] = {
  refreshAccessTokens: true, // Enables access token refreshing
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

## Upgrade Notes

- `getAuthenticateData`, `identificationField`, and `passwordField` have been removed since version 4.0.0
- `timeFactor` has been removed since version 2.1.0


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
