import UserIdleService from 'ember-user-activity/services/user-idle';
import Configuration from '../configuration';

export default UserIdleService.extend({
  IDLE_TIMEOUT: Configuration.invalidateAfter
});
