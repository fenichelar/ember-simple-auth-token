/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

var app = new EmberAddon();
var pickFiles = require('broccoli-static-compiler');
var mergeTrees = require('broccoli-merge-trees');

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

app.import(app.bowerDirectory + '/ember-simple-auth/simple-auth.amd.js', {
  exports: {
    'simple-auth/authenticators/base':                    ['default'],
    'simple-auth/authorizers/base':                       ['default'],
    'simple-auth/mixins/application-route-mixin':         ['default'],
    'simple-auth/mixins/authenticated-route-mixin':       ['default'],
    'simple-auth/mixins/unauthenticated-route-mixin':     ['default'],
    'simple-auth/mixins/authentication-controller-mixin': ['default'],
    'simple-auth/mixins/login-controller-mixin':          ['default'],
    'simple-auth/stores/base':                            ['default'],
    'simple-auth/stores/ephemeral':                       ['default'],
    'simple-auth/stores/local-storage':                   ['default'],
    'simple-auth/session':                                ['default'],
    'simple-auth/configuration':                          ['default'],
    'simple-auth/setup':                                  ['default']
  }
});

var sinon = pickFiles(app.bowerDirectory + '/sinon', {
  srcDir: '/',
  files: ['index.js'],
  destDir: '/assets/sinon'
});

module.exports = mergeTrees([app.toTree(), sinon]);
