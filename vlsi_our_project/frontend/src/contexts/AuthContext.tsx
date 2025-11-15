import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'

interface User {
  email?: string
  name?: string
  picture?: string
  sub: string
  provider?: 'google' | 'github' | 'facebook'
}

interface AuthContextType {
  user: User | null
  login: (credential: string) => void
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) || 'http://localhost:5000'
  const normalizedBackend = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(`${normalizedBackend}/api/auth/me`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        const sessionUser: User = {
          ...(data.user || {}),
          provider: data.provider,
        }
        setUser(sessionUser)
        localStorage.setItem('sessionUser', JSON.stringify(sessionUser))
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      } else {
        localStorage.removeItem('sessionUser')
        const storedToken = localStorage.getItem('token')
        if (!storedToken) {
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Error refreshing auth session:', error)
    }
  }, [normalizedBackend])

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    const storedSessionUser = localStorage.getItem('sessionUser')

    if (storedSessionUser && !storedToken) {
      try {
        setUser(JSON.parse(storedSessionUser))
      } catch (error) {
        console.error('Failed to parse stored session user:', error)
        localStorage.removeItem('sessionUser')
      }
    }

    if (storedUser && storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken)
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(storedUser))
        } else {
          // Token expired, clear storage
          localStorage.removeItem('user')
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Error decoding token:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }

    refreshSession().catch((error) => {
      console.error('Failed to refresh auth session:', error)
    })
  }, [refreshSession])

  const login = (credential: string) => {
    try {
      const decoded: any = jwtDecode(credential)
      const userData: User = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        sub: decoded.sub,
        provider: 'google'
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('token', credential)
      localStorage.removeItem('sessionUser')
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const logout = useCallback(async () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('sessionUser')

    try {
      await fetch(`${normalizedBackend}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Backend logout failed:', error)
    }
  }, [normalizedBackend])

  const value = {
    user,
    login,
    logout,
    refreshSession,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
