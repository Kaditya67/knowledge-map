"use client"

import { useState, useEffect } from "react"
import { useApp } from "../context/AppContext"
import PageCard from "../components/page/PageCard"
import Select from "../components/ui/Select"
import Button from "../components/ui/Button"
import { Star, Grid, List, FileText, Sparkles } from "lucide-react"

function HomePage() {
  const { pages, loading, error, fetchPages } = useApp()

  const [filter, setFilter] = useState("all")
  const [showFavorites, setShowFavorites] = useState(false)
  const [viewMode, setViewMode] = useState("grid")

  /* ---------------- Persist View Mode ---------------- */
  useEffect(() => {
    const savedView = localStorage.getItem("viewMode")
    if (savedView) setViewMode(savedView)
  }, [])

  useEffect(() => {
    localStorage.setItem("viewMode", viewMode)
  }, [viewMode])

  /* ---------------- Fetch Pages ---------------- */
  useEffect(() => {
    fetchPages({
      type: filter !== "all" ? filter : undefined,
      favorite: showFavorites ? true : undefined,
    })
  }, [filter, showFavorites])

  const typeOptions = [
    { value: "all", label: "All Types" },
    { value: "concept", label: "Concepts" },
    { value: "setup", label: "Setups" },
    { value: "project", label: "Projects" },
    { value: "custom", label: "Custom" },
  ]

  /* ---------------- Loading ---------------- */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading your knowledge...
        </p>
      </div>
    )
  }

  /* ---------------- Error ---------------- */
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
          <FileText className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => fetchPages()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-500" />
            My Knowledge
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {pages.length} {pages.length === 1 ? "page" : "pages"} in your personal wiki
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={showFavorites ? "primary" : "secondary"}
            size="sm"
            onClick={() => setShowFavorites((p) => !p)}
          >
            <Star
              className={`w-4 h-4 mr-1.5 ${showFavorites ? "fill-current" : ""}`}
            />
            Favorites
          </Button>

          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={typeOptions}
            className="w-40"
          />

          {/* View toggle */}
          <div className="flex border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button
              aria-pressed={viewMode === "grid"}
              onClick={() => setViewMode("grid")}
              className={`p-2.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>

            <button
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition-colors ${
                viewMode === "list"
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- Content ---------------- */}
      {pages.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
            <FileText className="w-10 h-10 text-indigo-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No pages yet
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Create your first page to start building your personal knowledge base.
          </p>
          <Button to="/new" variant="primary">
            Create your first page
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              : "space-y-4"
          }
        >
          {pages.map((page) => (
            <PageCard key={page._id} page={page} />
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage
