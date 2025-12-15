"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, Edit, Star, Trash2, Calendar, Clock } from "lucide-react"
import api from "../services/api"
import { useApp } from "../context/AppContext"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import BlockRenderer from "../components/blocks/BlockRenderer"

function PageView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toggleFavorite, deletePage } = useApp()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true)
        const data = await api.getPage(id)
        setPage(data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [id])

  const handleFavorite = async () => {
    const updated = await toggleFavorite(id)
    setPage({ ...page, isFavorite: updated.isFavorite })
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      await deletePage(id)
      navigate("/")
    }
  }

  const typeColors = {
    concept: "#6366f1",
    setup: "#10b981",
    project: "#f59e0b",
    custom: "#8b5cf6",
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || "Page not found"}</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleFavorite}>
            <Star className={`w-5 h-5 ${page.isFavorite ? "text-amber-500 fill-amber-500" : "text-slate-400"}`} />
          </Button>
          <Link to={`/page/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <Edit className="w-4 h-4 mr-1.5" />
              Edit
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {/* Page Content */}
      <article className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-800">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-700 shadow-md flex items-center justify-center text-3xl">
              {page.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{page.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge color={typeColors[page.type]}>{page.type}</Badge>
                {page.tags?.map((tag) => (
                  <Badge key={tag._id} color={tag.color}>
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {page.summary && (
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">{page.summary}</p>
          )}

          <div className="flex items-center gap-6 mt-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Created {new Date(page.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Updated {new Date(page.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Blocks */}
        <div className="p-8">
          {page.blocks?.length > 0 ? (
            <div className="space-y-6">
              {page.blocks.map((block) => (
                <BlockRenderer key={block._id} block={block} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">No content yet. Edit this page to add blocks.</p>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}

export default PageView
