import { useState, useEffect } from "react"
import { Search, X, Filter, Star } from "lucide-react"
import Input from "../ui/Input"
import Select from "../ui/Select"

export default function MediaFilters({ 
  onFilterChange, 
  config, 
  allGenres = [], 
  allTags = [],
  initialFilters = {}
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    minRating: "",
    maxRating: "",
    genres: [],
    tags: [],
    favorite: false,
    ...initialFilters
  })

  const [searchDebounce, setSearchDebounce] = useState(null)

  useEffect(() => {
    // Debounce search
    if (searchDebounce) clearTimeout(searchDebounce)
    
    const timeout = setTimeout(() => {
      onFilterChange(filters)
    }, 300)
    
    setSearchDebounce(timeout)
    
    return () => clearTimeout(timeout)
  }, [filters])

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleClearAll = () => {
    setFilters({
      search: "",
      status: "all",
      minRating: "",
      maxRating: "",
      genres: [],
      tags: [],
      favorite: false
    })
  }

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search" && value) return true
    if (key === "status" && value !== "all") return true
    if (key === "favorite" && value) return true
    if ((key === "genres" || key === "tags") && value.length > 0) return true
    if ((key === "minRating" || key === "maxRating") && value) return true
    return false
  }).length

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    ...(config?.customStatuses?.map(s => ({ value: s.value, label: s.label })) || [])
  ]

  const genreOptions = allGenres.map(g => ({ value: g, label: g }))
  const tagOptions = allTags.map(t => ({ value: t, label: t }))

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Search Bar - Always Visible */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange("search", e.target.value)}
            placeholder="Search by title or notes..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors text-sm dark:text-white"
          />
          {filters.search && (
            <button
              onClick={() => handleChange("search", "")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="px-4 pb-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span>Advanced Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-500">{isExpanded ? "Hide" : "Show"}</span>
        </button>
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4 animate-fade-in">
          {/* Status & Favorite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={filters.status}
              onChange={(e) => handleChange("status", e.target.value)}
              options={statusOptions}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Quick Filters</label>
              <button
                onClick={() => handleChange("favorite", !filters.favorite)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                  filters.favorite
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-600"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Star className={`w-4 h-4 ${filters.favorite ? "fill-amber-500 text-amber-500" : ""}`} />
                <span className="text-sm font-medium">Favorites Only</span>
              </button>
            </div>
          </div>

          {/* Rating Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Rating"
              type="number"
              min="0"
              max="10"
              value={filters.minRating}
              onChange={(e) => handleChange("minRating", e.target.value)}
              placeholder="0"
            />
            <Input
              label="Max Rating"
              type="number"
              min="0"
              max="10"
              value={filters.maxRating}
              onChange={(e) => handleChange("maxRating", e.target.value)}
              placeholder="10"
            />
          </div>

          {/* Genres */}
          {allGenres.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Genres</label>
              <div className="flex flex-wrap gap-2">
                {allGenres.map(genre => (
                  <button
                    key={genre}
                    onClick={() => {
                      const newGenres = filters.genres.includes(genre)
                        ? filters.genres.filter(g => g !== genre)
                        : [...filters.genres, genre]
                      handleChange("genres", newGenres)
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                      filters.genres.includes(genre)
                        ? "bg-indigo-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const newTags = filters.tags.includes(tag)
                        ? filters.tags.filter(t => t !== tag)
                        : [...filters.tags, tag]
                      handleChange("tags", newTags)
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                      filters.tags.includes(tag)
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clear All */}
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="w-full py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
