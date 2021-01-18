'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
      useYarn: true,
      scenarios: [
        {
          name: 'ember-lts-2.16-ember-simple-auth-1.6',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^1.6.0',
              'ember-source': '~2.16.0'
            }
          }
        },
        {
          name: 'ember-lts-2.16-ember-simple-auth-2.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^2.0.0',
              'ember-source': '~2.16.0'
            }
          }
        },
        {
          name: 'ember-lts-2.18-ember-simple-auth-1.6',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^1.6.0',
              'ember-source': '~2.18.0'
            }
          }
        },
        {
          name: 'ember-lts-2.18-ember-simple-auth-2.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^2.0.0',
              'ember-source': '~2.18.0'
            }
          }
        },
        {
          name: 'ember-lts-3.4-ember-simple-auth-1.6',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^1.6.0',
              'ember-source': '~3.4.0'
            }
          }
        },
        {
          name: 'ember-lts-3.4-ember-simple-auth-2.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^2.0.0',
              'ember-source': '~3.4.0'
            }
          }
        },
        {
          name: 'ember-lts-3.4-ember-simple-auth-3.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^3.0.0',
              'ember-source': '~3.4.0'
            }
          }
        },
        {
          name: 'ember-lts-3.8-ember-simple-auth-1.6',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^1.6.0',
              'ember-source': '~3.8.0'
            }
          }
        },
        {
          name: 'ember-lts-3.8-ember-simple-auth-2.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^2.0.0',
              'ember-source': '~3.8.0'
            }
          }
        },
        {
          name: 'ember-lts-3.8-ember-simple-auth-3.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^3.0.0',
              'ember-source': '~3.8.0'
            }
          }
        },
        {
          name: 'ember-lts-3.12-ember-simple-auth-1.6',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^1.6.0',
              'ember-source': '~3.12.0'
            }
          }
        },
        {
          name: 'ember-lts-3.12-ember-simple-auth-2.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^2.0.0',
              'ember-source': '~3.12.0'
            }
          }
        },
        {
          name: 'ember-lts-3.12-ember-simple-auth-3.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^3.0.0',
              'ember-source': '~3.12.0'
            }
          }
        },
        {
          name: 'ember-lts-3.16-ember-simple-auth-1.6',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^1.6.0',
              'ember-source': '~3.16.0'
            }
          }
        },
        {
          name: 'ember-lts-3.16-ember-simple-auth-2.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^2.0.0',
              'ember-source': '~3.16.0'
            }
          }
        },
        {
          name: 'ember-lts-3.16-ember-simple-auth-3.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^3.0.0',
              'ember-source': '~3.16.0'
            }
          }
        },
        {
          name: 'ember-release-ember-simple-auth-1.6',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^1.6.0',
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-release-ember-simple-auth-2.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^2.0.0',
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-release-ember-simple-auth-3.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^3.0.0',
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-beta-ember-simple-auth-1.6',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^1.6.0',
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-beta-ember-simple-auth-2.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^2.0.0',
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-beta-ember-simple-auth-3.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^3.0.0',
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-canary-ember-simple-auth-1.6',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^1.6.0',
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-canary-ember-simple-auth-2.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^2.0.0',
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-canary-ember-simple-auth-3.0',
          npm: {
            devDependencies: {
              'ember-simple-auth': '^3.0.0',
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-canary-ember-simple-auth-canary',
          npm: {
            devDependencies: {
              'ember-simple-auth': '>1.0.0-alpha',
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-release-ember-simple-auth-canary',
          npm: {
            devDependencies: {
              'ember-simple-auth': '>1.0.0-alpha',
              'ember-source': urls[0]
            }
          }
        }
      ]
    };
  });
};
