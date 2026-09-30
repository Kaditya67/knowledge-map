"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const { user, updatePreferences } = useAuth()
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme")
      if (saved) return saved === "dark"
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return false
  })

  // Watch for auth user's colorMode
  useEffect(() => {
    if (user?.preferences?.colorMode) {
      if (user.preferences.colorMode === "dark") {
        setIsDark(true)
      } else if (user.preferences.colorMode === "light") {
        setIsDark(false)
      } else if (user.preferences.colorMode === "system") {
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
      }
    }
  }, [user?.preferences?.colorMode])

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  const toggleTheme = async () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    // Attempt to save to preferences if logged in
    if (user) {
      try {
        await updatePreferences({ colorMode: newIsDark ? "dark" : "light" })
      } catch (err) {
        console.error("Failed to save theme preference", err)
      }
    }
  }

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
