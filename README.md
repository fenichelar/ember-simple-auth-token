# Ember Simple Auth Token [![Build Status](https://travis-ci.org/jpadilla/ember-cli-simple-auth-token.svg?branch=master)](https://travis-ci.org/jpadilla/ember-cli-simple-auth-token)

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

The `authenticate` action that is triggered by submitting the form is provided
by the `LoginControllerMixin` that the respective controller in the application
can include (the controller can also implement its own action and use the
session API directly; see the
[API docs for `Session`](http://ember-simple-auth.simplabs.com/ember-simple-auth-api-docs.html#SimpleAuth-Session)).
It then also needs to specify the Token authenticator to be used:

**Token Authenticator**

Default base implementation for token authentication.

```js
// app/controllers/login.js
import Ember from 'ember';
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend(LoginControllerMixin, {
  authenticator: 'simple-auth-authenticator:token'
});
```

**JWT Authenticator**

Extends the Token Authenticator and adds automatic refresh functionality.

```js
// app/controllers/login.js
import Ember from 'ember';
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin';

export default Ember.Controller.extend(LoginControllerMixin, {
  authenticator: 'simple-auth-authenticator:jwt'
});
```

Please note, the JWT authenticator will decode a token and look for the
expiration time found by looking up the token[JWT.tokenExpireName]. It then
calculated the difference between current time and the expire time to
determine when to make the next automatic token refresh request.

For example, your decoded token might look like this:

token = {
  'user': 'george',
  'email': 'george@castanza.com'
  'exp': '98343234' // <ISO-8601> UTC seconds from e.g. python backend.
}

In this case the token expire name is using the default `exp` as set by the
`JWT.tokenExpireName` property.

An automatic token refresh request would be sent out at token[tokenExpireName] - now()

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
  timeFactor: 1  // example - set to "1000" to convert incoming seconds to milliseconds.
```
