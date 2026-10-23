import axios, { AxiosError } from 'axios';
import { clearSession } from './session';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('loggedUserToken');
  const userId = window.localStorage.getItem('loggedUserId');
  if (token) {
    config.headers.set('Authorization', token);
  }
  if (userId) {
    config.headers.set('User-Id', userId);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token was revoked or expired server-side; drop the stale local copy so
      // the router guard and navbar stop treating this device as logged in.
      clearSession();
      window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export default api;
