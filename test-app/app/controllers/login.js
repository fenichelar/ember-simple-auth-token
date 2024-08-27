import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LoginController extends Controller {
  @service session;
  @service router;

  @tracked errorMessage = '';
  username = 'admin';
  password = 'abc123';

  @action
  async authenticate(e) {
    this.errorMessage = '';
    e.preventDefault();
    e.stopPropagation();
    this.session.authenticate('authenticator:jwt', {username: this.username, password: this.password}).catch(err => {
      if (err.status === 401) {
        this.errorMessage = 'Incorrect username or password';
        return;
      }
      let errorMessage = '';
      if (err.text) {
        try {
          if (this.isJsonResponse(err.text)) {
            errorMessage = JSON.parse(err.text).errors[0].message;
          } else {
            errorMessage = err.text;
          }
        } catch(er) {
          this.errorMessage = 'An unexpected error occurred. ' + er.toString();
        }
      } else {
        errorMessage = err;
      }
      this.errorMessage = errorMessage;
    });
  }

  isJsonResponse(response) {
    if (typeof response !== 'string') return false;
    try {
      const result = JSON.parse(response);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]' || type === '[object Array]';
    } catch (err) {
      return false;
    }
  }
}
