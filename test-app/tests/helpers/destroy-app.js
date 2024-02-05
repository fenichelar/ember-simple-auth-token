import { run } from '@ember/runloop';

export default function destroyApp(application) {
  // eslint-disable-next-line ember/no-runloop
  run(application, 'destroy');
}
