import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, getUser } from '../api/client'

const AuthContext = createContext(null)

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/`
}

function deleteCookie(name) {
  document.cookie = `${name}=; path=/; max-age=0`
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      const token = getCookie('token')
      if (!token) {
        setLoading(false)
        return
      }

      const payload = parseJwt(token)
      if (!payload) {
        deleteCookie('token')
        setLoading(false)
        return
      }

      try {
        const user = await getUser(payload.sub)
        setCurrentUser(user)
        setIsAdmin(payload.is_admin ?? false)
      } catch {
        deleteCookie('token')
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [])

  async function login(email, password) {
    const { access_token } = await apiLogin(email, password)
    setCookie('token', access_token)
    const payload = parseJwt(access_token)
    const user = await getUser(payload.sub)
    setCurrentUser(user)
    setIsAdmin(payload.is_admin ?? false)
    return user
  }

  function logout() {
    deleteCookie('token')
    setCurrentUser(null)
    setIsAdmin(false)
  }

  function isOwner(ownerId) {
    return currentUser?.id === ownerId
  }

  return (
    <AuthContext.Provider
      value={{ currentUser, isAdmin, loading, login, logout, isOwner }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}