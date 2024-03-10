import Cookies from 'js-cookie';
// token 值 在 Cookie 中key名称
const TokenKey = 'payback_token';
const RefreshTokenKey = 'payback_refreshToken';

export function getToken(): any {
  return Cookies.get(TokenKey);
}

export function setToken(token: string, expire: number) {
  return Cookies.set(TokenKey, token, { expires: expire / 24 / 60 / 60 });
}
export function getRefreshToken() {
  return Cookies.get(RefreshTokenKey);
}

export function setRefreshToken(token: string, expire: number) {
  return Cookies.set(RefreshTokenKey, token, { expires: expire / 24 / 60 / 60 });
}

export function clearLogin() {
  localStorage.clear();
  // 删除用户信息
  Cookies.remove(TokenKey);
  return Cookies.remove(RefreshTokenKey);
}
