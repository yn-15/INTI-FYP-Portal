import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)

function normaliseUser(u) {
  return {
    id:            u.id,
    first_name:    u.firstName  ?? u.first_name,
    last_name:     u.lastName   ?? u.last_name,
    email:         u.email,
    role:          u.role,
    status:        u.status,
    department_id: u.departmentId ?? u.department_id ?? null,
    company_name:  u.companyName  ?? u.company_name  ?? null,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser  = localStorage.getItem('fyp_user')
    const storedToken = localStorage.getItem('fyp_token')
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser))
        api.me()
          .then(fresh => {
            const norm = normaliseUser(fresh)
            setUser(norm)
            localStorage.setItem('fyp_user', JSON.stringify(norm))
          })
          .catch(() => {
            localStorage.removeItem('fyp_user')
            localStorage.removeItem('fyp_token')
            setUser(null)
          })
      } catch {
        localStorage.removeItem('fyp_user')
        localStorage.removeItem('fyp_token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const data = await api.login(email, password)
      const norm = normaliseUser(data.user)
      localStorage.setItem('fyp_token', data.token)
      localStorage.setItem('fyp_user',  JSON.stringify(norm))
      setUser(norm)
      return { success: true, user: norm }
    } catch (err) {
      if (err.code === 'pending')      return { success: false, error: 'pending' }
      if (err.code === 'deactivated')  return { success: false, error: 'Your account has been deactivated. Please contact the FYP administrator.' }
      return { success: false, error: err.message || 'Invalid email or password.' }
    }
  }

  const register = async (data) => {
    try {
      await api.register({
        firstName:   data.first_name,
        lastName:    data.last_name,
        email:       data.email,
        password:    data.password,
        role:        data.role,
        companyName: data.company_name || undefined,
      })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('fyp_token')
    localStorage.removeItem('fyp_user')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const fresh = await api.me()
      const norm  = normaliseUser(fresh)
      setUser(norm)
      localStorage.setItem('fyp_user', JSON.stringify(norm))
    } catch { /* silent */ }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
