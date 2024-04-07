'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    autoImport: {
      watchDependencies: ['ember-simple-auth-token'],
    }
  });

  /*const { maybeEmbroider } = require('@embroider/test-setup');
  return maybeEmbroider(app);*/

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    packagerOptions: {
      webpackConfig: {
        node: {global: true},
        plugins: [
          new NodePolyfillPlugin({
            includeAliases: ['Buffer', 'crypto', 'fs', 'process', 'stream', 'util', 'vm']
          })
        ],
        devtool: 'eval-source-map' // optional for browser tools debugging
      },
    },
  });
};
