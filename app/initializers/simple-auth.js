import Configuration from 'simple-auth/configuration';
import setup from 'simple-auth/setup';

export default {
  name: 'simple-auth',
  initialize: function(container, application) {
    setup(container, application);
  }
};
