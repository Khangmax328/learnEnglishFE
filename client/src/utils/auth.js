const ACCESS_KEY = "access_token";
const EXPIRE_KEY = "token_expire";

export const getToken = () =>
  localStorage.getItem(ACCESS_KEY) || sessionStorage.getItem(ACCESS_KEY);

export const setToken = (token, expireAt, remember) => {
  const store = remember ? localStorage : sessionStorage;
  store.setItem(ACCESS_KEY, token);
  store.setItem(EXPIRE_KEY, String(expireAt));
};

export const clearToken = () => {
  [localStorage, sessionStorage].forEach(s => {
    s.removeItem(ACCESS_KEY);
    s.removeItem(EXPIRE_KEY);
  });
};

export const isTokenExpired = () => {
  const exp =
    Number(localStorage.getItem(EXPIRE_KEY)) ||
    Number(sessionStorage.getItem(EXPIRE_KEY));
  return !exp || Date.now() >= exp;
};
