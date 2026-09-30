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

  useEffect(() => {
    if (user?.preferences?.accentColor) {
      document.documentElement.setAttribute('data-theme', user.preferences.accentColor)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
  }, [user])

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

  const updatePreferences = async (newPrefs) => {
    try {
      const updatedPrefs = await api.updatePreferences(newPrefs)
      setUser((prevUser) => ({
        ...prevUser,
        preferences: updatedPrefs
      }))
      return updatedPrefs
    } catch (error) {
      console.error("Failed to update preferences:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updatePreferences, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
