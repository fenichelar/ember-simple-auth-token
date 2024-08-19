import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class LoginController extends Controller {
  @service session;
  @service router;
  username = 'admin';
  password = 'abc123';

  @action
  async authenticate(e) {
    e.preventDefault();
    e.stopPropagation();
    const authenticator = 'authenticator:jwt';
    this.session.authenticate(authenticator, {username: this.username, password: this.password}).catch(err => {
      if (err.status === 401) {
        alert('Incorrect username or password');
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
          alert('An unexpected error occured. ' + er.toString());
        }
      } else {
        errorMessage = err;
      }
      alert(errorMessage);
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
