import Cookies from 'js-cookie'

const TokenKey = 'sn_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getLocalStorage(key) {
  return localStorage.getItem(key)
}

export function setLocalStorage(key, val) {
  if (typeof val === 'object') val = JSON.stringify(val)
  return localStorage.setItem(key, val)
}

export function removeLocalStorage(key) {
  return localStorage.removeItem(key)
}
