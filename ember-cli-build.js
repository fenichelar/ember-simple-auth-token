/*jshint node:true*/
/* global require, module */
var Funnel = require('broccoli-funnel');
var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  var app = new EmberAddon(defaults, {
     // Add options here
  });

  var extraAssets = new Funnel(app.bowerDirectory + '/sinon', {
    srcDir: '/',
    files: ['index.js'],
    destDir: '/assets/sinon'
  });

  return app.toTree(extraAssets);
};
