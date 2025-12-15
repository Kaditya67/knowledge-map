"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Sun, Moon, X, Command } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"
import api from "../../services/api"

function Header() {
  const { isDark, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const results = await api.quickSearch(searchQuery)
          setSearchResults(results)
          setShowResults(true)
        } catch (error) {
          console.error("Search error:", error)
        }
      } else {
        setSearchResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  const handleResultClick = (pageId) => {
    navigate(`/page/${pageId}`)
    setSearchQuery("")
    setShowResults(false)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowResults(false)
    }
  }

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="relative flex-1 max-w-2xl" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-24 py-2.5 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 dark:focus:border-indigo-400 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all duration-200"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("")
                    setShowResults(false)
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 bg-slate-200 dark:bg-slate-700 rounded-md">
                <Command className="w-3 h-3" />K
              </kbd>
            </div>
          </div>
        </form>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden z-50 animate-fade-in">
            <div className="max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={result._id}
                  onClick={() => handleResultClick(result._id)}
                  className={`w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-left transition-colors ${
                    index !== 0 ? "border-t border-slate-100 dark:border-slate-700" : ""
                  }`}
                >
                  <span className="text-2xl">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{result.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{result.type}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={handleSearchSubmit}
              className="w-full px-4 py-3 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-t border-slate-200 dark:border-slate-700 text-center transition-colors"
            >
              View all results for "{searchQuery}"
            </button>
          </div>
        )}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="ml-4 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200 hover:scale-105"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </header>
  )
}

export default Header
