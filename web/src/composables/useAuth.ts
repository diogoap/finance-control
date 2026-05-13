import api from '../lib/api';

const SESSION_KEYS = [
  'loggedUserId',
  'loggedUserEmail',
  'loggedUserToken',
  'loggedUserName',
  'loggedUserPhoto',
] as const;

export function logoff(allSessions: boolean) {
  return api.get(`/auth/logoff?all=${allSessions}`);
}

export function clearSession() {
  for (const key of SESSION_KEYS) {
    window.localStorage.removeItem(key);
  }
}
