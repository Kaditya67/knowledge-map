"use client"

import { useState } from "react"
import { Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react"
import Button from "../ui/Button"
import Input from "../ui/Input"
import Select from "../ui/Select"

function BlockEditor({ block, onUpdate, onDelete, dragHandleProps }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [content, setContent] = useState(block.content)

  const handleSave = () => {
    onUpdate({ ...block, content })
    setIsEditing(false)
  }

  const renderEditor = () => {
    switch (block.type) {
      case "markdown":
        return (
          <textarea
            value={content.text}
            onChange={(e) => setContent({ ...content, text: e.target.value })}
            className="w-full h-64 px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors resize-none"
            placeholder="Write your markdown here..."
          />
        )

      case "image":
        return (
          <div className="space-y-4">
            <Input
              label="Image URL"
              value={content.url}
              onChange={(e) => setContent({ ...content, url: e.target.value })}
              placeholder="https://example.com/image.png"
            />
            <Input
              label="Caption (optional)"
              value={content.caption || ""}
              onChange={(e) => setContent({ ...content, caption: e.target.value })}
              placeholder="Image caption"
            />
          </div>
        )

      case "gallery":
        return (
          <div className="space-y-4">
            {(content.images || []).map((image, index) => (
              <div key={index} className="flex gap-3 items-end p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                <Input
                  label={`Image ${index + 1} URL`}
                  value={image.url}
                  onChange={(e) => {
                    const newImages = [...content.images]
                    newImages[index] = { ...newImages[index], url: e.target.value }
                    setContent({ ...content, images: newImages })
                  }}
                  className="flex-1"
                />
                <Input
                  label="Caption"
                  value={image.caption || ""}
                  onChange={(e) => {
                    const newImages = [...content.images]
                    newImages[index] = { ...newImages[index], caption: e.target.value }
                    setContent({ ...content, images: newImages })
                  }}
                  className="flex-1"
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    const newImages = content.images.filter((_, i) => i !== index)
                    setContent({ ...content, images: newImages })
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setContent({
                  ...content,
                  images: [...(content.images || []), { url: "", caption: "" }],
                })
              }}
            >
              Add Image
            </Button>
          </div>
        )

      case "link":
        return (
          <div className="space-y-4">
            <Input
              label="URL"
              value={content.url}
              onChange={(e) => setContent({ ...content, url: e.target.value })}
              placeholder="https://example.com"
            />
            <Input
              label="Label"
              value={content.label}
              onChange={(e) => setContent({ ...content, label: e.target.value })}
              placeholder="Link label"
            />
            <Input
              label="Description (optional)"
              value={content.description || ""}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              placeholder="Brief description"
            />
            <Select
              label="Link Type"
              value={content.linkType || "other"}
              onChange={(e) => setContent({ ...content, linkType: e.target.value })}
              options={[
                { value: "documentation", label: "Documentation" },
                { value: "github", label: "GitHub" },
                { value: "medium", label: "Medium" },
                { value: "drive", label: "Google Drive" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>
        )

      case "diagram":
        return (
          <div className="space-y-4">
            <Input
              label="Diagram URL"
              value={content.url}
              onChange={(e) => setContent({ ...content, url: e.target.value })}
              placeholder="https://app.eraser.io/..."
            />
            <Input
              label="Title"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              placeholder="Diagram title"
            />
            <Select
              label="Tool"
              value={content.tool || "other"}
              onChange={(e) => setContent({ ...content, tool: e.target.value })}
              options={[
                { value: "eraser", label: "Eraser" },
                { value: "drawio", label: "Draw.io" },
                { value: "excalidraw", label: "Excalidraw" },
                { value: "figma", label: "Figma" },
                { value: "other", label: "Other" },
              ]}
            />
          </div>
        )

      case "note":
        return (
          <div className="space-y-4">
            <textarea
              value={content.text}
              onChange={(e) => setContent({ ...content, text: e.target.value })}
              className="w-full h-24 px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors resize-none"
              placeholder="Write your note..."
            />
            <Select
              label="Note Type"
              value={content.noteType || "info"}
              onChange={(e) => setContent({ ...content, noteType: e.target.value })}
              options={[
                { value: "info", label: "Info" },
                { value: "warning", label: "Warning" },
                { value: "success", label: "Success" },
                { value: "error", label: "Error" },
              ]}
            />
          </div>
        )

      default:
        return null
    }
  }

  const blockTypeLabels = {
    markdown: "Markdown",
    image: "Image",
    gallery: "Gallery",
    link: "Link",
    diagram: "Diagram",
    note: "Note",
  }

  const blockTypeIcons = {
    markdown: "📝",
    image: "🖼️",
    gallery: "🎨",
    link: "🔗",
    diagram: "📊",
    note: "📌",
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div
            {...dragHandleProps}
            className="cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <GripVertical className="w-5 h-5" />
          </div>
          <span className="text-lg">{blockTypeIcons[block.type]}</span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{blockTypeLabels[block.type]}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          {isEditing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      </div>
      {!isCollapsed && <div className="p-4">{isEditing ? renderEditor() : <BlockPreview block={block} />}</div>}
    </div>
  )
}

function BlockPreview({ block }) {
  switch (block.type) {
    case "markdown":
      return (
        <pre className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap line-clamp-4 font-mono bg-slate-50 dark:bg-slate-900 p-3 rounded-lg">
          {block.content.text || "Empty markdown block"}
        </pre>
      )
    case "image":
      return (
        <div className="flex items-center gap-3">
          <img
            src={block.content.url || "/placeholder.svg?height=64&width=64&query=image preview"}
            alt=""
            className="w-16 h-16 object-cover rounded-lg"
          />
          <span className="text-sm text-slate-600 dark:text-slate-400">{block.content.caption || "No caption"}</span>
        </div>
      )
    case "gallery":
      return (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {block.content.images?.length || 0} images in gallery
        </span>
      )
    case "link":
      return (
        <span className="text-sm text-indigo-600 dark:text-indigo-400">{block.content.label || "Untitled link"}</span>
      )
    case "diagram":
      return (
        <span className="text-sm text-slate-600 dark:text-slate-400">{block.content.title || "Untitled diagram"}</span>
      )
    case "note":
      return (
        <span
          className={`text-sm ${
            block.content.noteType === "warning"
              ? "text-amber-600"
              : block.content.noteType === "error"
                ? "text-red-600"
                : block.content.noteType === "success"
                  ? "text-emerald-600"
                  : "text-blue-600"
          }`}
        >
          {block.content.text || "Empty note"}
        </span>
      )
    default:
      return null
  }
}

export default BlockEditor
