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
          name: 'ember-lts-2.16',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0'
            },
            devDependencies: {
              'ember-source': '~2.16.0'
            }
          }
        },
        {
          name: 'ember-lts-2.18',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0'
            },
            devDependencies: {
              'ember-source': '~2.18.0'
            }
          }
        },
        {
          name: 'ember-lts-3.4',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0'
            },
            devDependencies: {
              'ember-source': '~3.4.0'
            }
          }
        },
        {
          name: 'ember-lts-3.8',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0'
            },
            devDependencies: {
              'ember-source': '~3.8.0'
            }
          }
        },
        {
          name: 'ember-lts-3.12',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0'
            },
            devDependencies: {
              'ember-source': '~3.12.0'
            }
          }
        },
        {
          name: 'ember-release',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0'
            },
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-beta',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0'
            },
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-canary',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0'
            },
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-default',
          npm: {
            devDependencies: {}
          }
        },
        {
          name: 'ember-simple-auth-2.x',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0'
            },
            devDependencies: {
              // minimum ember version supported by ember-simple-auth@2.x
              'ember-source': '~2.16.0'
            }
          }
        },
        {
          name: 'ember-simple-auth-3.x',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              // minimum ember version supported by ember-simple-auth@3.x
              'ember-source': '~3.0.0'
            }
          }
        }
      ]
    };
  });
};
