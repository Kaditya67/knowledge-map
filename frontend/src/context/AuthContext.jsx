import { createContext, useState, useEffect, useContext } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          // Verify token and get user data
          const userData = await api.getMe()
          setUser(userData)
        } catch (error) {
          console.error("Auth check failed:", error)
          localStorage.removeItem("token")
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    const data = await api.login({ email, password })
    localStorage.setItem("token", data.token)
    setUser(data)
    return data
  }

  const register = async (username, email, password) => {
    const data = await api.register({ username, email, password })
    localStorage.setItem("token", data.token)
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
