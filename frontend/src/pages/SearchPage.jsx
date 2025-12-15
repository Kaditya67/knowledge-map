"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, FileText } from "lucide-react"
import api from "../services/api"
import PageCard from "../components/page/PageCard"
import Badge from "../components/ui/Badge"

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [results, setResults] = useState({ pages: [], tags: [] })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const searchQuery = searchParams.get("q")
    if (searchQuery) {
      setQuery(searchQuery)
      performSearch(searchQuery)
    }
  }, [searchParams])

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return

    try {
      setLoading(true)
      const data = await api.search(searchQuery)
      setResults(data)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
        <Search className="w-8 h-8 text-indigo-500" />
        Search
      </h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-10">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, tags..."
            className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all duration-200 text-lg"
          />
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Searching...</p>
        </div>
      ) : (
        <>
          {/* Tags Results */}
          {results.tags.length > 0 && (
            <div className="mb-10">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {results.tags.map((tag) => (
                  <Badge key={tag._id} color={tag.color} className="text-sm px-4 py-2">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Pages Results */}
          {results.pages.length > 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Pages ({results.pages.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {results.pages.map((page) => (
                  <PageCard key={page._id} page={page} />
                ))}
              </div>
            </div>
          ) : searchParams.get("q") ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No results found</h2>
              <p className="text-slate-500 dark:text-slate-400">
                No pages match "{searchParams.get("q")}". Try a different search term.
              </p>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export default SearchPage
