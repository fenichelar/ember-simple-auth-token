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
          name: 'ember-lts-2.16-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~2.16.0'
            }
          }
        },
        {
          name: 'ember-lts-2.16-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~2.16.0'
            }
          }
        },
        {
          name: 'ember-lts-2.18-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~2.18.0'
            }
          }
        },
        {
          name: 'ember-lts-2.18-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~2.18.0'
            }
          }
        },
        {
          name: 'ember-lts-3.4-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.4.0'
            }
          }
        },
        {
          name: 'ember-lts-3.4-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.4.0'
            }
          }
        },
        {
          name: 'ember-lts-3.4-ember-simple-auth-3.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              'ember-source': '~3.4.0'
            }
          }
        },
        {
          name: 'ember-lts-3.4-ember-simple-auth-4.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^4.0.0'
            },
            devDependencies: {
              'ember-source': '~3.4.0'
            }
          }
        },
        {
          name: 'ember-lts-3.8-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.8.0'
            }
          }
        },
        {
          name: 'ember-lts-3.8-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.8.0'
            }
          }
        },
        {
          name: 'ember-lts-3.8-ember-simple-auth-3.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              'ember-source': '~3.8.0'
            }
          }
        },
        {
          name: 'ember-lts-3.8-ember-simple-auth-4.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^4.0.0'
            },
            devDependencies: {
              'ember-source': '~3.8.0'
            }
          }
        },
        {
          name: 'ember-lts-3.12-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.12.0'
            }
          }
        },
        {
          name: 'ember-lts-3.12-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.12.0'
            }
          }
        },
        {
          name: 'ember-lts-3.12-ember-simple-auth-3.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              'ember-source': '~3.12.0'
            }
          }
        },
        {
          name: 'ember-lts-3.12-ember-simple-auth-4.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^4.0.0'
            },
            devDependencies: {
              'ember-source': '~3.12.0'
            }
          }
        },
        {
          name: 'ember-lts-3.16-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.16.0'
            }
          }
        },
        {
          name: 'ember-lts-3.16-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.16.0'
            }
          }
        },
        {
          name: 'ember-lts-3.16-ember-simple-auth-3.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              'ember-source': '~3.16.0'
            }
          }
        },
        {
          name: 'ember-lts-3.16-ember-simple-auth-4.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^4.0.0'
            },
            devDependencies: {
              'ember-source': '~3.16.0'
            }
          }
        },
        {
          name: 'ember-lts-3.20-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.20.0'
            }
          }
        },
        {
          name: 'ember-lts-3.20-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.20.0'
            }
          }
        },
        {
          name: 'ember-lts-3.20-ember-simple-auth-3.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              'ember-source': '~3.20.0'
            }
          }
        },
        {
          name: 'ember-lts-3.20-ember-simple-auth-4.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^4.0.0'
            },
            devDependencies: {
              'ember-source': '~3.20.0'
            }
          }
        },
        {
          name: 'ember-lts-3.24-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.24.0'
            }
          }
        },
        {
          name: 'ember-lts-3.24-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.24.0'
            }
          }
        },
        {
          name: 'ember-lts-3.24-ember-simple-auth-3.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              'ember-source': '~3.24.0'
            }
          }
        },
        {
          name: 'ember-lts-3.24-ember-simple-auth-4.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^4.0.0'
            },
            devDependencies: {
              'ember-source': '~3.24.0'
            }
          }
        },
        {
          name: 'ember-lts-3.28-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.28.0'
            }
          }
        },
        {
          name: 'ember-lts-3.28-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': '~3.28.0'
            }
          }
        },
        {
          name: 'ember-lts-3.28-ember-simple-auth-3.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              'ember-source': '~3.28.0'
            }
          }
        },
        {
          name: 'ember-lts-3.28-ember-simple-auth-4.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^4.0.0'
            },
            devDependencies: {
              'ember-source': '~3.28.0'
            }
          }
        },
        {
          name: 'ember-release-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-release-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-release-ember-simple-auth-3.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-release-ember-simple-auth-4.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^4.0.0'
            },
            devDependencies: {
              'ember-source': urls[0]
            }
          }
        },
        {
          name: 'ember-beta-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-beta-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-beta-ember-simple-auth-3.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-beta-ember-simple-auth-4.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^4.0.0'
            },
            devDependencies: {
              'ember-source': urls[1]
            }
          }
        },
        {
          name: 'ember-canary-ember-simple-auth-1.6',
          npm: {
            dependencies: {
              'ember-simple-auth': '^1.6.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-canary-ember-simple-auth-2.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^2.0.0',
              'whatwg-fetch': '3.3.1'
            },
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
        {
          name: 'ember-canary-ember-simple-auth-3.0',
          npm: {
            dependencies: {
              'ember-simple-auth': '^3.0.0'
            },
            devDependencies: {
              'ember-source': urls[2]
            }
          }
        },
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
        }
      ]
    };
  });
};
