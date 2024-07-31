'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
      scenarios: [
        {
          name: 'ember-canary-ember-simple-auth-4.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^4.0.0'
            },
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-canary-ember-simple-auth-5.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^5.0.0'
            },
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        }
      ]
    };
  });
};