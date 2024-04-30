import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import ENV from 'test-app/config/environment';

export default class HeaderComponent extends Component {
  @service session;

  willTokenRefresh = false;
  countdown = null;
  refreshLeeway = 0;
  @tracked remainingMinutes = 0;
  @tracked remainingSeconds = 0;

  get displayMinutes() {
    return this.remainingMinutes.toString();
  }

  get displaySeconds() {
    let seconds = this.remainingSeconds.toString();
    return seconds.length < 2 ? '0' + seconds : seconds;
  }

  constructor() {
    super(...arguments);
    if (ENV['ember-simple-auth-token'].refreshAccessTokens) {
      this.willTokenRefresh = true;
      if (typeof ENV['ember-simple-auth-token'].refreshLeeway !== 'undefined') {
        this.refreshLeeway = ENV['ember-simple-auth-token'].refreshLeeway * 1000;
      }
    }

    if (ENV.environment !== 'test') {
      this.setCountdown();
    }
  }

  setCountdown() {
    let minutes = 0;
    let seconds = 0;
    let now = new Date().valueOf();
    let diff = Math.round((this.session.data.authenticated.exp * 1000) - (now + this.refreshLeeway));
    if (diff < 0) {
      setTimeout(() => {
        this.setCountdown();
      }, 500);
      return;
    }
    let mod = 0;
    if (diff >= 60000) {
      mod = diff % 60000;
      minutes = (diff - mod) / 60000;
      seconds = Math.round(mod / 1000);
    } else {
      seconds = Math.round(diff / 1000);
    }
    this.remainingSeconds = seconds;
    if (minutes) {
      this.remainingMinutes = minutes;
    }
    setTimeout(() => {
      this.doCountdown();
    }, 1000);
  }

  doCountdown() {
    if (this.remainingSeconds === 0) {
      this.remainingMinutes = this.remainingMinutes - 1;
      this.remainingSeconds = 59;
    } else {
      this.remainingSeconds = this.remainingSeconds - 1;
    }
    if (this.remainingSeconds === 0 && this.remainingMinutes === 0) {
      setTimeout(() => {
        this.setCountdown();
      }, 500);
      return;
    }
    setTimeout(() => {
      this.doCountdown();
    }, 1000);
  }

  @action
  logout() {
    this.session.invalidate();
  }
}
