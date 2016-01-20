module.exports = {
  scenarios: [
    {
      name: 'default',
      dependencies: { }
    },
    {
      name: 'Ember 1.13',
      dependencies: {
        ember: '1.13.12',
        'ember-data': '1.13.15'
      }
    },
    {
      name: 'ember-release',
      dependencies: {
        ember: 'release',
        'ember-data': 'release'
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        ember: 'beta',
        'ember-data': 'beta'
      },
      resolutions: {
        ember: 'beta'
      }
    },
    {
      name: 'ember-canary',
      dependencies: {
        ember: 'canary',
        'ember-data': 'canary'
      },
      resolutions: {
        ember: 'canary'
      }
    }
  ]
};
