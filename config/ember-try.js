'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then(urls => {
    return {
      scenarios: [
        {
          name: 'ember-lts-3.4-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^3.4.0'
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-lts-3.8-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^3.8.0'
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-lts-3.12-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^3.12.0'
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-lts-3.16-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^3.16.0'
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-lts-3.20-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^3.20.0'
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-lts-3.24-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^3.24.0'
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
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
          name: 'ember-lts-4.4-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^4.4.0'
            },
            ember: {
              'edition': 'octane'
            }
          }
        },
        {
          name: 'ember-lts-4.8-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^4.8.0'
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
          name: 'ember-lts-5.8-ember-simple-auth-6.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^6.0.0'
            },
            devDependencies: {
              'ember-source': '^5.8.0'
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
