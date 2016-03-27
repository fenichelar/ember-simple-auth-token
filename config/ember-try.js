/*jshint node:true*/
module.exports = function() {
  return {
    useVersionCompatibility: true,
    scenarios: [
      {
        name: 'default',
        bower: {
          dependencies: { }
        }
      },
      {
        name: 'ember-release',
        bower: {
          dependencies: {
            'ember': 'components/ember#release'
          },
          resolutions: {
            'ember': 'release'
          }
        }
      },
      {
        name: 'ember-beta',
        allowedToFail: true,
        bower: {
          dependencies: {
            'ember': 'components/ember#beta'
          },
          resolutions: {
            'ember': 'beta'
          }
        }
      },
      {
        name: 'ember-canary',
        allowedToFail: true,
        bower: {
          dependencies: {
            'ember': 'components/ember#canary'
          },
          resolutions: {
            'ember': 'canary'
          }
        }
      }
    ]
  };
};
