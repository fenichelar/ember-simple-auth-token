# Ember Simple Auth Token
[![Build Status](https://travis-ci.org/jpadilla/ember-cli-simple-auth-token.svg?branch=master)](https://travis-ci.org/jpadilla/ember-cli-simple-auth-token) [![Ember Observer Score](http://emberobserver.com/badges/ember-cli-simple-auth-token.svg)](http://emberobserver.com/addons/ember-cli-simple-auth-token)

This is an extension to the Ember Simple Auth library that provides a default token authenticator, an enhanced authenticator with automatic refresh capability, and an authorizer that are compatible with APIs with token-based authentication.

**As your user's credentials as well as the token are exchanged between the
Ember.js app and the server you have to make sure that this connection uses HTTPS!**

Based on [ember-simple-auth-devise](https://github.com/simplabs/ember-simple-auth/tree/master/packages/ember-simple-auth-devise).

## Installation

To install Ember Simple Auth Token in an Ember.js application that uses [Ember CLI](https://github.com/stefanpenner/ember-cli):

Make sure you have [ember-cli-simple-auth](https://github.com/simplabs/ember-cli-simple-auth) installed:

```
npm install --save-dev ember-cli-simple-auth
ember generate ember-cli-simple-auth
```

To install simply run:

```
npm install --save-dev ember-cli-simple-auth-token
ember generate simple-auth-token
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
  actions: {
    authenticate: function() {
      var credentials = this.getProperties('identification', 'password'),
        authenticator = 'simple-auth-authenticator:token';

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
  actions: {
    authenticate: function() {
      var credentials = this.getProperties('identification', 'password'),
        authenticator = 'simple-auth-authenticator:jwt';

      this.get('session').authenticate(authenticator, credentials);
    }
  }
});
```

Please note, the JWT authenticator will decode a token and look for the
expiration time found by looking up the token[Config.tokenExpireName]. It then
calculates the difference between the current time and the token expire time —
from which the *refreshLeeway* is subtracted — to determine when to make the
next automatic token refresh request.

For example, with the following configuration:

```
  ENV['simple-auth'] = {
    authorizer: 'simple-auth-authorizer:token'
  };
  ENV['simple-auth-token'] = {
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

An automatic token refresh request would be sent out at token[Config.tokenExpireName] - now(). A good practice with regards to token refreshing is to also set a "leeway", usually no more than a few minutes, to account for clock skew when decoding JSON Web Tokens in the server-side. Some libraries like [PyJWT](https://github.com/jpadilla/pyjwt) and [ruby-jwt](https://github.com/progrium/ruby-jwt) already support this.

## The Authorizer

The authorizer authorizes requests by adding `token` property from the session in the `Authorization` header:

```
Authorization: Bearer <token>
```

To use the authorizer, configure it in the global environment object:

```js
// config/environment.js
ENV['simple-auth'] = {
  authorizer: 'simple-auth-authorizer:token'
};
```

## Available Customization Options

For the Token authenticator:

```js
// config/environment.js
ENV['simple-auth-token'] = {
  serverTokenEndpoint: '/api-token-auth/',
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
  serverTokenRefreshEndpoint: '/api-token-refresh/',
  tokenExpireName: 'exp',
  refreshLeeway: 0,
  timeFactor: 1  // example - set to "1000" to convert incoming seconds to milliseconds.
```
