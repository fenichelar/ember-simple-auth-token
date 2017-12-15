/* eslint-env node */
'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'dummy',
    environment,
    rootURL: '/',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    contentSecurityPolicy: {
      'default-src': "'none'",
      'script-src': "'self' 'unsafe-eval'",
      'font-src': "'self' https://maxcdn.bootstrapcdn.com",
      'connect-src': "'self'",
      'img-src': "'self'",
      'style-src': "'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com",
      'media-src': "'self'"
    }
  };

  if (environment === 'development') {
    ENV['ember-simple-auth'] = {
      authorizer: 'authorizer:token',
      applicationRootUrl: ENV.rootURL
    };

    ENV['ember-simple-auth-token'] = {
      refreshTokenPropertyName: 'token',
      serverTokenEndpoint: '/api/token-auth/',
      serverTokenRefreshEndpoint: '/api/token-refresh/',
      refreshLeeway: 5
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.rootURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.rootURL = '/ember-simple-auth-token';
    ENV.API_URL = 'https://simple-auth-token-server.herokuapp.com';

    ENV['ember-simple-auth'] = {
      authorizer: 'authorizer:token',
      applicationRootUrl: ENV.rootURL,
      crossOriginWhitelist: [ENV.API_URL]
    };

    ENV['ember-simple-auth-token'] = {
      serverTokenEndpoint: ENV.API_URL + '/api/token-auth/',
      serverTokenRefreshEndpoint: ENV.API_URL + '/api/token-refresh/',
      refreshLeeway: 5
    };
  }

  return ENV;
};
