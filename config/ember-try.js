'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
      scenarios: [
        {
          name: 'ember-lts-3.28-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^3.28.0'
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-lts-4.12-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^4.12.0'
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-lts-5.4-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^5.4.0'
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-release-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': urls[0]
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-beta-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': urls[1]
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-canary-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': urls[2]
            },
            ember: {
              'edition': 'octane'
            }
          }
        }
      ]
    };
  });
};