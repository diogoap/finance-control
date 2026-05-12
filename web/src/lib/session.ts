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
