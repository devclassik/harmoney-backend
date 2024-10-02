import { Axios } from 'axios';
import config from '../config';
import { CronJob } from 'cron';
import { logger } from '../utils';

export const keepAlive = () => {
  // runs every 1 minute
  const job = new CronJob('* * * * *', async function () {
    const url =
      config.app.env === 'local'
        ? `${config.app.url}:${config.app.port}`
        : `${config.app.url}`;

    const api = new Axios({
      baseURL: url,
    });

    await api.get('/');
  });

  try {
    job.start();
  } catch (error) {
    logger.warn(`CRON error (keepAlive): ${error}`);
  }
};
