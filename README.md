# Ember Simple Auth Token

This is an extension to the Ember Simple Auth library that provides an
authenticator and an authorizer that are compatible with APIs with token-based authentication.

Based on [ember-simple-auth-devise](https://github.com/simplabs/ember-simple-auth/tree/master/packages/ember-simple-auth-devise).

## Installation

To install Ember Simple Auth Token in an Ember.js application that uses [Ember CLI](https://github.com/stefanpenner/ember-cli):

```
npm install ember-cli-simple-auth-token --save-dev
```

## The Authenticator

In order to use the Token authenticator the application needs to have a login route:

```js
App.Router.map(function() {
  this.route('login');
});
```

This route displays the login form with fields for `identification`,
`password`:

```html
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

```js
// app/controllers/login.js
import LoginControllerMixin from 'simple-auth/mixins/login-controller-mixin'

export default Ember.Controller.extend(LoginControllerMixin, {
  authenticator: 'authenticator:token'
});
```

## The Authorizer

The authorizer authorizes requests by adding `token` property from the session in the `Authorization` header:

```
Authorization: Bearer <token>
```

To use the authorizer, configure it in the global environment object:

```js
window.ENV = window.ENV || {};
window.ENV['simple-auth'] = {
  authorizer: 'authorizer:token'
}
```

## Available Customization Options

```js
window.ENV = window.ENV || {};
window.ENV['simple-auth'] = {
  authorizer: 'authorizer:token',
  crossOriginWhitelist: ['https://api.example.com']
}
window.ENV['simple-auth-token'] = {
  serverTokenEndpoint: 'https://api.example.com/auth/signin/',
  authorizationPrefix: 'JWT ',
  tokenPropertyName: 'authToken',
  authorizationHeaderName: 'X-Auth'
}
```
