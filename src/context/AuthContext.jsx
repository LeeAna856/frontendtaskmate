import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { extractErrors, getToken, setToken } from '../lib/api'

const AuthContext = createContext(null)
const USER_KEY = 'taskmate_user'

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())
  const [loading, setLoading] = useState(Boolean(getToken()))

  const persistUser = useCallback((nextUser) => {
    setUser(nextUser)
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    } else {
      localStorage.removeItem(USER_KEY)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // The token may already be invalid — clear the session regardless.
    }
    setToken(null)
    persistUser(null)
  }, [persistUser])

  // Validate the stored token on boot.
  useEffect(() => {
    let cancelled = false

    async function restore() {
      if (!getToken()) {
        setLoading(false)
        return
      }

      try {
        const { data } = await api.get('/auth/me')
        if (!cancelled) {
          persistUser(data.user)
        }
      } catch {
        if (!cancelled) {
          setToken(null)
          persistUser(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    restore()

    return () => {
      cancelled = true
    }
  }, [persistUser])

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post('/auth/login', credentials)
      setToken(data.token)
      persistUser(data.user)
      return data
    },
    [persistUser],
  )

  const register = useCallback(
    async (payload) => {
      const { data } = await api.post('/auth/register', payload)
      setToken(data.token)
      persistUser(data.user)
      return data
    },
    [persistUser],
  )

  const updateProfile = useCallback(
    async (payload) => {
      const { data } = await api.put('/auth/profile', payload)
      persistUser(data.user)
      return data
    },
    [persistUser],
  )

  const changePassword = useCallback(async (payload) => {
    const { data } = await api.put('/auth/password', payload)
    if (data.token) {
      setToken(data.token)
    }
    return data
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, loading, login, register, logout, updateProfile, changePassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }

  return context
}

export { extractErrors }
