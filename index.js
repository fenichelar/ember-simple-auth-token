'use strict';

var path = require('path'),
    fs   = require('fs');

function EmberCLISimpleAuthToken(project) {
  this.project = project;
  this.name    = 'Ember CLI Simple Auth Token';
}

function unwatchedTree(dir) {
  return {
    read:    function() { return dir; },
    cleanup: function() { }
  };
}

EmberCLISimpleAuthToken.prototype.treeFor = function included(name) {
  var treePath = path.join('node_modules', 'ember-cli-simple-auth-token', name);

  if (fs.existsSync(treePath)) {
    return unwatchedTree(treePath);
  }
};

EmberCLISimpleAuthToken.prototype.included = function included(app) {
  this.app = app;
};

module.exports = EmberCLISimpleAuthToken;
