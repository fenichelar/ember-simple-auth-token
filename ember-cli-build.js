/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-addon');
var Funnel = require('broccoli-funnel');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
  });

  var extraAssets = new Funnel(app.bowerDirectory + '/sinon', {
    srcDir: '/',
    files: ['index.js'],
    destDir: '/assets/sinon'
  });

  app.import(app.bowerDirectory + '/ember-simple-auth/simple-auth.amd.js', {
    exports: {
      'simple-auth/authenticators/base': ['default'],
      'simple-auth/authorizers/base': ['default'],
      'simple-auth/mixins/application-route-mixin': ['default'],
      'simple-auth/mixins/authenticated-route-mixin': ['default'],
      'simple-auth/mixins/unauthenticated-route-mixin': ['default'],
      'simple-auth/mixins/authentication-controller-mixin': ['default'],
      'simple-auth/mixins/login-controller-mixin': ['default'],
      'simple-auth/stores/base': ['default'],
      'simple-auth/stores/ephemeral': ['default'],
      'simple-auth/stores/local-storage': ['default'],
      'simple-auth/session': ['default'],
      'simple-auth/configuration': ['default'],
      'simple-auth/setup': ['default']
    }
  });

  return app.toTree();
};
