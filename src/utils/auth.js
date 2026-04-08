const AUTH_USER_KEY = 'dondoc-auth-user'

export function getStoredAuthUser() {
  const raw = localStorage.getItem(AUTH_USER_KEY)

  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export function setStoredAuthUser(user) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function clearStoredAuthUser() {
  localStorage.removeItem(AUTH_USER_KEY)
}
