/*jshint node:true*/
/* global require, module */
var Funnel = require('broccoli-funnel');
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
     // Add options here
  });

  app.import('bower_components/qunit/qunit/qunit.js');
  app.import('bower_components/ember-qunit/ember-qunit.amd.js');

  var extraAssets = new Funnel(app.bowerDirectory + '/sinon', {
    srcDir: '/',
    files: ['index.js'],
    destDir: '/assets/sinon'
  });

  return app.toTree(extraAssets);
};
