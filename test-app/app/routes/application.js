import Route from '@ember/routing/route';
import { inject } from '@ember/service';
//import ENV from 'test-app/config/environment';

export default class ApplicationRoute extends Route {
  @inject session;

  async beforeModel() {
    // test if the api solution (mirage / express) is running
    /*fetch(`${ENV.api}/api/helloworld`).then(response => {
      response.text().then(text => {
        console.log(JSON.parse(text).message);
      });
    });*/
    await this.session.setup();
  }
}
