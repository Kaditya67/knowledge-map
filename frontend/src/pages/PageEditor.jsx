"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Plus, Save, Loader2 } from "lucide-react"
import api from "../services/api"
import { useApp } from "../context/AppContext"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"
import BlockEditor from "../components/blocks/BlockEditor"
import Modal from "../components/ui/Modal"

function PageEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { createPage, updatePage, tags } = useApp()
  const isNew = !id

  const [page, setPage] = useState({
    title: "",
    type: "concept",
    summary: "",
    icon: "📄",
    tags: [],
  })
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)

  useEffect(() => {
    if (!isNew) {
      const fetchPage = async () => {
        try {
          const data = await api.getPage(id)
          setPage({
            title: data.title,
            type: data.type,
            summary: data.summary,
            icon: data.icon,
            tags: data.tags?.map((t) => t._id) || [],
          })
          setBlocks(data.blocks || [])
        } catch (error) {
          console.error("Failed to fetch page:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchPage()
    }
  }, [id, isNew])

  const moveBlock = (from, to) => {
  setBlocks((prev) => {
    if (to < 0 || to >= prev.length) return prev

    const updated = [...prev]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)

    // 🔑 keep order in sync
    return updated.map((b, i) => ({
      ...b,
      order: i,
    }))
  })
}

  const handleSave = async () => {
    try {
      setSaving(true)

      let savedPage
      if (isNew) {
        savedPage = await createPage(page)
      } else {
        savedPage = await updatePage(id, page)
      }

      for (const block of blocks) {
        if (block._id?.startsWith("temp-")) {
          await api.createBlock({
            pageId: savedPage._id,
            type: block.type,
            content: block.content,
            order: block.order,
          })
        } else if (block._id) {
          await api.updateBlock(block._id, {
            type: block.type,
            content: block.content,
            order: block.order,
          })
        }
      }

      navigate(`/page/${savedPage._id}`)
    } catch (error) {
      console.error("Failed to save page:", error)
      alert("Failed to save page. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const addBlock = (type) => {
    const defaultContent = {
      markdown: { text: "" },
      image: { url: "", caption: "" },
      gallery: { images: [] },
      link: { url: "", label: "", description: "", linkType: "other" },
      diagram: { url: "", title: "", tool: "other" },
      note: { text: "", noteType: "info" },
    }

    const newBlock = {
      _id: `temp-${Date.now()}`,
      type,
      content: defaultContent[type],
      order: blocks.length,
    }

    setBlocks([...blocks, newBlock])
    setShowBlockModal(false)
  }

  const updateBlock = (index, updatedBlock) => {
    const newBlocks = [...blocks]
    newBlocks[index] = updatedBlock
    setBlocks(newBlocks)
  }

  const deleteBlock = async (index) => {
    const block = blocks[index]
    if (block._id && !block._id.startsWith("temp-")) {
      try {
        await api.deleteBlock(block._id)
      } catch (error) {
        console.error("Failed to delete block:", error)
      }
    }
    setBlocks(blocks.filter((_, i) => i !== index))
  }

  const typeOptions = [
    { value: "concept", label: "Concept" },
    { value: "setup", label: "Setup" },
    { value: "project", label: "Project" },
    { value: "custom", label: "Custom" },
  ]

  const iconOptions = [
    "📄",
    "📝",
    "📚",
    "💡",
    "🔧",
    "🚀",
    "🎯",
    "🔴",
    "🟢",
    "🔵",
    "⚡",
    "🔐",
    "🌐",
    "📊",
    "🎨",
    "🤖",
    "📦",
    "🗂️",
    "💾",
    "🔗",
  ]

  const blockTypes = [
    { type: "markdown", label: "Markdown", icon: "📝", desc: "Rich text content" },
    { type: "image", label: "Image", icon: "🖼️", desc: "Single image with caption" },
    { type: "gallery", label: "Gallery", icon: "🎨", desc: "Multiple images" },
    { type: "link", label: "Link", icon: "🔗", desc: "External resource" },
    { type: "diagram", label: "Diagram", icon: "📊", desc: "Embedded diagram" },
    { type: "note", label: "Note", icon: "📌", desc: "Highlighted callout" },
  ]

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
      </div>
    )
  }

  const buildDocumentJSON = () => {
    return {
      page,
      blocks: [...blocks]
        .sort((a, b) => a.order - b.order)
        .map(({ _id, ...rest }) => rest),
    }
  }

  const copyJSON = async () => {
    const json = JSON.stringify(buildDocumentJSON(), null, 2)
    await navigator.clipboard.writeText(json)
    alert("Page JSON copied to clipboard")
  }

  const downloadJSON = () => {
    const json = JSON.stringify(buildDocumentJSON(), null, 2)
    const blob = new Blob([json], { type: "application/json" })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${page.title || "untitled-page"}.json`
    a.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Cancel
        </button>

        <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={copyJSON}>
          Copy JSON
        </Button>

        <Button variant="secondary" size="sm" onClick={downloadJSON}>
          Download JSON
        </Button>

        <Button onClick={handleSave} disabled={saving || !page.title.trim()}>
          {saving ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      </div>

      {/* Page Details */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-5">Page Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Input
            label="Title"
            value={page.title}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
            placeholder="Page title"
          />

          <Select
            label="Type"
            value={page.type}
            onChange={(e) => setPage({ ...page, type: e.target.value })}
            options={typeOptions}
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Summary</label>
          <textarea
            value={page.summary}
            onChange={(e) => setPage({ ...page, summary: e.target.value })}
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors resize-none"
            rows={2}
            placeholder="Brief summary of this page"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setPage({ ...page, icon })}
                  className={`w-10 h-10 text-xl rounded-xl border-2 transition-all duration-200 ${
                    page.icon === icon
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 scale-110"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag._id}
                  onClick={() => {
                    const newTags = page.tags.includes(tag._id)
                      ? page.tags.filter((t) => t !== tag._id)
                      : [...page.tags, tag._id]
                    setPage({ ...page, tags: newTags })
                  }}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    page.tags.includes(tag._id) ? "ring-2 ring-offset-2 ring-indigo-500 scale-105" : ""
                  }`}
                  style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Content Blocks</h2>
          <Button variant="secondary" size="sm" onClick={() => setShowBlockModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Block
          </Button>
        </div>

        {blocks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            <p className="text-slate-500 dark:text-slate-400">
              No blocks yet. Add your first block to start building content.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <BlockEditor
                key={block._id}
                block={block}
                onUpdate={(updated) => updateBlock(index, updated)}
                onDelete={() => deleteBlock(index)}
                onMoveUp={index > 0 ? () => moveBlock(index, index - 1) : null}
                onMoveDown={
                  index < blocks.length - 1 ? () => moveBlock(index, index + 1) : null
                }
              />
            ))}

          </div>
        )}
      </div>

      {/* Add Block Modal */}
      <Modal isOpen={showBlockModal} onClose={() => setShowBlockModal(false)} title="Add Block">
        <div className="grid grid-cols-2 gap-3">
          {blockTypes.map((bt) => (
            <button
              key={bt.type}
              onClick={() => addBlock(bt.type)}
              className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border-2 border-transparent hover:border-indigo-500 rounded-xl transition-all duration-200 text-left group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{bt.icon}</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{bt.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{bt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default PageEditor
