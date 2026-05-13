export interface Session {
  userId: string;
  name: string;
  email: string;
  photo: string;
}

export function getSession(): Session {
  return {
    userId: window.localStorage.getItem('loggedUserId') ?? '',
    name: window.localStorage.getItem('loggedUserName') ?? '',
    email: window.localStorage.getItem('loggedUserEmail') ?? '',
    photo: window.localStorage.getItem('loggedUserPhoto') ?? '',
  };
}

export function isLoggedIn(): boolean {
  const token = window.localStorage.getItem('loggedUserToken');
  return !!token && token.length > 0;
}

function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!hash) return params;
  const trimmed = hash.charAt(0) === '#' ? hash.slice(1) : hash;
  for (const pair of trimmed.split('&')) {
    const idx = pair.indexOf('=');
    if (idx === -1) continue;
    const key = decodeURIComponent(pair.slice(0, idx));
    const value = decodeURIComponent(pair.slice(idx + 1));
    params[key] = value;
  }
  return params;
}

export function consumeOAuthHash() {
  const params = parseHashParams(window.location.hash);
  if (!params.id || !params.token) return;

  window.localStorage.setItem('loggedUserId', params.id);
  window.localStorage.setItem('loggedUserEmail', params.email ?? '');
  window.localStorage.setItem('loggedUserToken', params.token);
  window.localStorage.setItem('loggedUserName', params.name ?? '');
  window.localStorage.setItem('loggedUserPhoto', params.photo ?? '');

  if (window.history?.replaceState) {
    window.history.replaceState(
      null,
      '',
      window.location.pathname + window.location.search,
    );
  }
}
