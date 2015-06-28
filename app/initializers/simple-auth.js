import Configuration from 'simple-auth/configuration';
import getGlobalConfig from 'simple-auth-token/utils/get-global-config';
import setup from 'simple-auth/setup';

export default {
  name: 'simple-auth',
  initialize: function(container, application) {
    Configuration.load(container, getGlobalConfig('simple-auth'));
    setup(container, application);
  }
};
