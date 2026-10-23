import api from '../lib/api';

export { clearSession } from '../lib/session';

export function logoff(allSessions: boolean) {
  // /auth/* lives outside the /api prefix on the server.
  return api.get('/auth/logoff', { baseURL: '/', params: { all: allSessions } });
}
