import Authenticator from './../authenticators/token';
import Authorizer    from './../authorizers/token';


export default {
  name:       'simple-auth-token',
  before:      'simple-auth',
  initialize: function(container){
    container.register('simple-auth-authorizer:token', Authorizer);
    container.register('simple-auth-authenticator:token', Authenticator);
  }
};
