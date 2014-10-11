import { test, moduleForComponent } from 'ember-qunit';
import startApp from '../../helpers/start-app';
import Ember from 'ember';
import isSecureUrl from 'simple-auth-token/utils/is-secure-url';

var App;

module('Configuration', {
  setup: function() {
    App = startApp();
  },
  teardown: function() {
    Ember.run(App, App.destroy);
  }
});

test('#isSecureUrl is true for "https://example.com"', function() {
  ok(isSecureUrl('https://example.com'));
});

test('#isSecureUrl is false for "http://example.com"', function() {
  ok(!isSecureUrl('http://example.com'));
});
