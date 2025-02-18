import { keepAlive } from './keepAliveCronjob';
// import { VasCronjob } from './vasCronjob';

export const startJobs = () => {
  keepAlive();

  // const vasCronjob = new VasCronjob();
  // vasCronjob.syncServices();
};
