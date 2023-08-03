import Cookies from 'js-cookie';
// token 值 在 Cookie 中key名称
const TokenKey: string = 'payback_token';
const RefreshTokenKey: string = 'payback_refreshToken';
export const UserAccount = 'ms_username';
export const UserRoles = 'ms_keys';

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

export function setUserInfo(account: string, permiss: string) {
  localStorage.setItem(UserAccount, account);
  localStorage.setItem(UserRoles, permiss);
}
export function clearLogin() {
  localStorage.clear();
  // 删除用户信息
  Cookies.remove(TokenKey);
  return Cookies.remove(RefreshTokenKey);
}
