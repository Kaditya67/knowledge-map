import { createContext, useState, useEffect, useContext } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState("login")
  const [onAuthSuccessCallback, setOnAuthSuccessCallback] = useState(null)

  const openAuthModal = (tab = "login", onSuccess = null) => {
    setAuthModalTab(tab)
    setOnAuthSuccessCallback(() => onSuccess)
    setIsAuthModalOpen(true)
  }

  const closeAuthModal = () => {
    setIsAuthModalOpen(false)
    setOnAuthSuccessCallback(null)
  }

  const handleAuthSuccess = () => {
    if (onAuthSuccessCallback) {
      onAuthSuccessCallback()
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const cachedUser = localStorage.getItem("user")

      if (token) {
        // If we have cached user data, populate immediately so user never gets logged out on refresh
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser))
          } catch {}
        }

        try {
          // Verify token and get fresh user data
          const userData = await api.getMe()
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
        } catch (error) {
          console.error("Auth check failed:", error)
          // Only clear if server explicitly responds with 401 unauthorized
          if (error.response?.status === 401) {
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            setUser(null)
          }
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
    localStorage.setItem("user", JSON.stringify(data))
    setUser(data)
    return data
  }

  const register = async (username, email, password) => {
    const data = await api.register({ username, email, password })
    localStorage.setItem("token", data.token)
    localStorage.setItem("user", JSON.stringify(data))
    setUser(data)
    return data
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
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
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updatePreferences,
        loading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        handleAuthSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
