/* jshint node: true */
/* global require, module */

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

/*
  This Brocfile specifes the options for the dummy test app of this
  addon, located in `/tests/dummy`

  This Brocfile does *not* influence how the addon or the app using it
  behave. You most likely want to be modifying `./index.js` or app's Brocfile
*/

var app = new EmberAddon();
var Funnel = require('broccoli-funnel');

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

var extraAssets = new Funnel(app.bowerDirectory + '/sinon', {
  srcDir: '/',
  files: ['index.js'],
  destDir: '/assets/sinon'
});

module.exports = app.toTree(extraAssets);
