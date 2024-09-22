import { Axios } from 'axios';
import config from '../config';

export const keepAlive = () => {
  const url =
    config.app.env === 'local'
      ? `${config.app.url}:${config.app.port}`
      : `${config.app.url}`;

  const api = new Axios({
    baseURL: url,
  });

  setInterval(async () => {
    await api.get('/');
  }, 30000);
};
