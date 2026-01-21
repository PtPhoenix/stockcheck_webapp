import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loginNonce, setLoginNonce] = useState(null)

  const refreshSession = useCallback(async () => {
    try {
      const me = await getCurrentUser()
      setUser(me)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const login = useCallback(async (credentials) => {
    await loginRequest(credentials)
    await refreshSession()
    setLoginNonce(Date.now())
  }, [refreshSession])

  const logout = useCallback(async () => {
    await logoutRequest()
    setUser(null)
    setLoginNonce(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refreshSession,
      loginNonce,
    }),
    [user, loading, login, logout, refreshSession, loginNonce],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
