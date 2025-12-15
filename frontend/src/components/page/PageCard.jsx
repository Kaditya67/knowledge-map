"use client"

import { Link } from "react-router-dom"
import { Star, MoreVertical, Edit, Trash2, Clock } from "lucide-react"
import { useState } from "react"
import Badge from "../ui/Badge"
import { useApp } from "../../context/AppContext"

function PageCard({ page }) {
  const { toggleFavorite, deletePage } = useApp()
  const [showMenu, setShowMenu] = useState(false)

  const typeColors = {
    concept: "#6366f1",
    setup: "#10b981",
    project: "#f59e0b",
    custom: "#8b5cf6",
  }

  const handleFavorite = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleFavorite(page._id)
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (window.confirm("Are you sure you want to delete this page?")) {
      await deletePage(page._id)
    }
    setShowMenu(false)
  }

  return (
    <Link
      to={`/page/${page._id}`}
      className="group block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200">
            {page.icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {page.title}
            </h3>
            <Badge color={typeColors[page.type]}>{page.type}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleFavorite}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Star className={`w-4 h-4 ${page.isFavorite ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-10 animate-fade-in">
                <Link
                  to={`/page/${page._id}/edit`}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {page.summary && <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">{page.summary}</p>}

      {page.tags && page.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {page.tags.map((tag) => (
            <Badge key={tag._id} color={tag.color}>
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        Updated {new Date(page.updatedAt).toLocaleDateString()}
      </div>
    </Link>
  )
}

export default PageCard
