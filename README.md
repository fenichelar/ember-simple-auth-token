# Ember Simple Auth Token

[![build-status-image]][travis]
[![ember-observer-score-image]][ember-observer]

This is an extension to the Ember Simple Auth library that provides a default token authenticator, an enhanced authenticator with automatic refresh capability, and an authorizer that are compatible with APIs with token-based authentication.

If you're thinking about using this addon in combination with JSON Web Tokens, you can find more about why they're so awesome in [this article][medium-jwt].

**As your user's credentials as well as the token are exchanged between the
Ember.js app and the server you have to make sure that this connection uses HTTPS!**

## Live Demo

View a live demo here: [https://jpadilla.github.io/ember-simple-auth-token/][demo]

## Installation

To install Ember Simple Auth Token in an Ember.js application that uses [Ember CLI][ember-cli]:

Make sure you have [ember-simple-auth][ember-simple-auth] installed:

```
ember install ember-simple-auth
```

To install simply run:

```
ember install ember-simple-auth-token
```

## The Authenticators

In order to use the Token authenticator or the JWT authenticator, the application needs to have a login route:

```js
// app/router.js
Router.map(function() {
  this.route('login');
});
```

This route displays the login form with fields for `identification`,
`password`:

```html
{{! app/templates/login.hbs }}
<form {{action 'authenticate' on='submit'}}>
  <label for="identification">Login</label>
  {{input id='identification' placeholder='Enter Login' value=identification}}
  <label for="password">Password</label>
  {{input id='password' placeholder='Enter Password' type='password' value=password}}
  <button type="submit">Login</button>
</form>
```

To handle the `authenticate` action that is triggered by submitting the form you can do the following in the respective controller:

Note: This was previously handled using Simple Auth's now deprecated `LoginControllerMixin`.

**Token Authenticator**

Default base implementation for token authentication.

```js
// app/controllers/login.js
import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),

  actions: {
    authenticate: function() {
      var credentials = this.getProperties('identification', 'password'),
        authenticator = 'authenticator:token';

      this.get('session').authenticate(authenticator, credentials);
    }
  }
});
```

**JWT Authenticator**

Extends the Token Authenticator and adds automatic token refresh functionality.

```js
// app/controllers/login.js
import Ember from 'ember';

export default Ember.Controller.extend({
  session: Ember.inject.service(),

  actions: {
    authenticate: function() {
      var credentials = this.getProperties('identification', 'password'),
        authenticator = 'authenticator:jwt';

      this.get('session').authenticate(authenticator, credentials);
    }
  }
});
```

Please note, the JWT authenticator will decode a token and look for the
expiration time found by looking up the `token[Config.tokenExpireName]``. It then
calculates the difference between the current time and the token expire time —
from which the *refreshLeeway* is subtracted — to determine when to make the
next automatic token refresh request.

For example, with the following configuration:

```
  ENV['ember-simple-auth'] = {
    authorizer: 'authorizer:token'
  };
  ENV['ember-simple-auth-token'] = {
    refreshAccessTokens: true,
    timeFactor: 1,
    refreshLeeway: 300 // Refresh the token 5 minutes (300s) before it expires.
  };
```

Your decoded token might look like this:

```
token = {
  'user': 'george',
  'email': 'george@castanza.com'
  'exp': '98343234' // <ISO-8601> UTC seconds from e.g. python backend.
}
```

*In this case the token expire name is using the default `exp` as set by the
`Config.tokenExpireName` property.*

An automatic token refresh request would be sent out at `token[Config.tokenExpireName] - now()``. A good practice with regards to token refreshing is to also set a "leeway", usually no more than a few minutes, to account for clock skew when decoding JSON Web Tokens in the server-side. Some libraries like [PyJWT][pyjwt] and [ruby-jwt][ruby-jwt] already support this.

## The Authorizer

The authorizer authorizes requests by adding `token` property from the session in the `Authorization` header:

```
Authorization: Bearer <token>
```

To use the authorizer, configure it in the global environment object:

```js
// config/environment.js
ENV['ember-simple-auth'] = {
  authorizer: 'authorizer:token'
};
```

## Sending token on API requests

If you need your token to be present on every request to your API you will need to inject the `DataAdapterMixin` from `ember-simple-auth` on your application `adapter`.

Example from the `ember-simple-auth` [documentation](http://ember-simple-auth.com/api/classes/DataAdapterMixin.html):
```js
// app/adapters/application.js
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, {
  authorizer: 'authorizer:application'
});
```
*DataAdapterMixin is supported for Ember 1.13 and above*

## Available Customization Options

For the Token authenticator:

```js
// config/environment.js
ENV['ember-simple-auth-token'] = {
  serverTokenEndpoint: '/api/token-auth/',
  identificationField: 'username',
  passwordField: 'password',
  tokenPropertyName: 'token',
  authorizationPrefix: 'Bearer ',
  authorizationHeaderName: 'Authorization',
  headers: {},
};
```

For the JWT authenticator (in addition to the Token authenticator fields):

```
  refreshAccessTokens: true,
  serverTokenRefreshEndpoint: '/api/token-refresh/',
  tokenExpireName: 'exp',
  refreshLeeway: 0,
  timeFactor: 1  // example - set to "1000" to convert incoming seconds to milliseconds.
```

[build-status-image]: https://travis-ci.org/jpadilla/ember-simple-auth-token.svg?branch=master
[travis]: https://travis-ci.org/jpadilla/ember-simple-auth-token
[ember-observer-score-image]: http://emberobserver.com/badges/ember-simple-auth-token.svg
[ember-observer]: http://emberobserver.com/addons/ember-simple-auth-token

[demo]: https://jpadilla.github.io/ember-simple-auth-token/
[ember-cli]: http://ember-cli.com/
[ember-simple-auth]: https://github.com/simplabs/ember-simple-auth
[pyjwt]: https://github.com/jpadilla/pyjwt
[ruby-jwt]: https://github.com/jwt/ruby-jwt
[medium-jwt]: https://medium.com/@leo/why-json-web-tokens-are-truly-awesome-23fb80b7fc20
