'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary'),
  ]).then(urls => {
    return {
      scenarios: [
        {
          name: 'ember-lts-4.4-ember-simple-auth-6.0',
          npm: {
            devDependencies: {
              'ember-source': '^4.4.0',
              'ember-simple-auth': '^6.0.0',
            },
          },
        },
        {
          name: 'ember-lts-4.8-ember-simple-auth-6.0',
          npm: {
            devDependencies: {
              'ember-source': '^4.8.0',
              'ember-simple-auth': '^6.0.0',
            },
          },
        },
        {
          name: 'ember-lts-4.12-ember-simple-auth-6.0',
          npm: {
            devDependencies: {
              'ember-source': '^4.12.0',
              'ember-simple-auth': '^6.0.0',
            },
          },
        },
        {
          name: 'ember-lts-5.4-ember-simple-auth-6.0',
          npm: {
            devDependencies: {
              'ember-source': '^5.4.0',
              'ember-simple-auth': '^6.0.0',
            },
          },
        },
        {
          name: 'ember-lts-5.8-ember-simple-auth-6.0',
          npm: {
            devDependencies: {
              'ember-source': '^5.8.0',
              'ember-simple-auth': '^6.0.0',
            },
          },
        },
        {
          name: 'ember-release-ember-simple-auth-6.0',
          npm: {
            devDependencies: {
              'ember-source': urls[0],
              'ember-simple-auth': '^6.0.0',
            },
          },
        },
        {
          name: 'ember-beta-ember-simple-auth-6.0',
          npm: {
            devDependencies: {
              'ember-source': urls[1],
              'ember-simple-auth': '^6.0.0',
            },
          },
        },
        {
          name: 'ember-canary-ember-simple-auth-6.0',
          npm: {
            devDependencies: {
              'ember-source': urls[2],
              'ember-simple-auth': '^6.0.0',
            },
          },
        },
      ],
    };
  });
};
