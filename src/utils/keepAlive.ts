import config from '../config';
import { apiClient } from './apiClient';

export const keepAlive = () => {
  const url =
    config.app.env === 'local'
      ? `${config.app.url}:${config.app.port}`
      : `${config.app.url}`;
  
  setInterval(async () => {
    const api = apiClient(url);
    await api.get<any>('/');
  }, 30000);
};
