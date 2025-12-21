"use client"

import { useState } from "react"
import {
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

import Button from "../ui/Button"
import Input from "../ui/Input"
import Select from "../ui/Select"

function BlockEditor({
  block,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [content, setContent] = useState(block.content)

  const handleSave = () => {
    onUpdate({ ...block, content })
    setIsEditing(false)
  }

  /* ---------------- Editors ---------------- */

  const renderEditor = () => {
    switch (block.type) {
      case "markdown":
        return (
          <textarea
            value={content.text}
            onChange={(e) => setContent({ ...content, text: e.target.value })}
            className="w-full h-64 px-4 py-3 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm resize-none focus:outline-none focus:border-indigo-500"
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
            />
            <Input
              label="Caption"
              value={content.caption || ""}
              onChange={(e) => setContent({ ...content, caption: e.target.value })}
            />
          </div>
        )

      case "gallery":
        return (
          <div className="space-y-4">
            {(content.images || []).map((img, i) => (
              <div
                key={i}
                className="flex gap-3 items-end p-4 bg-slate-50 dark:bg-slate-900 rounded-xl"
              >
                <Input
                  label={`Image ${i + 1} URL`}
                  value={img.url}
                  onChange={(e) => {
                    const images = [...content.images]
                    images[i] = { ...images[i], url: e.target.value }
                    setContent({ ...content, images })
                  }}
                />
                <Input
                  label="Caption"
                  value={img.caption || ""}
                  onChange={(e) => {
                    const images = [...content.images]
                    images[i] = { ...images[i], caption: e.target.value }
                    setContent({ ...content, images })
                  }}
                />
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    setContent({
                      ...content,
                      images: content.images.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setContent({
                  ...content,
                  images: [...(content.images || []), { url: "", caption: "" }],
                })
              }
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
            />
            <Input
              label="Label"
              value={content.label}
              onChange={(e) => setContent({ ...content, label: e.target.value })}
            />
            <Input
              label="Description"
              value={content.description || ""}
              onChange={(e) =>
                setContent({ ...content, description: e.target.value })
              }
            />
            <Select
              label="Link Type"
              value={content.linkType || "other"}
              onChange={(e) =>
                setContent({ ...content, linkType: e.target.value })
              }
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
            />
            <Input
              label="Title"
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
            />
          </div>
        )

      case "note":
        return (
          <div className="space-y-4">
            <textarea
              value={content.text}
              onChange={(e) => setContent({ ...content, text: e.target.value })}
              className="w-full h-24 px-4 py-3 border-2 rounded-xl resize-none"
            />
            <Select
              label="Note Type"
              value={content.noteType || "info"}
              onChange={(e) =>
                setContent({ ...content, noteType: e.target.value })
              }
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

  /* ---------------- Header UI ---------------- */

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-b">
        <div className="flex items-center gap-3">
          <GripVertical className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-medium capitalize">{block.type}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* MOVE */}
          <button
            onClick={onMoveUp}
            disabled={!onMoveUp}
            className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          <button
            onClick={onMoveDown}
            disabled={!onMoveDown}
            className="p-1.5 rounded-lg disabled:opacity-40 hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            {isCollapsed ? <ChevronDown /> : <ChevronUp />}
          </button>

          {isEditing ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={onDelete}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-4">
          {isEditing ? renderEditor() : <BlockPreview block={block} />}
        </div>
      )}
    </div>
  )
}

/* ---------------- Preview ---------------- */

function BlockPreview({ block }) {
  switch (block.type) {
    case "markdown":
      return (
        <pre className="text-sm whitespace-pre-wrap text-slate-600 dark:text-slate-400">
          {block.content.text || "Empty markdown block"}
        </pre>
      )
    case "image":
      return (
        <div className="flex gap-3 items-center">
          <img
            src={block.content.url}
            alt=""
            className="w-16 h-16 object-cover rounded-lg"
          />
          <span className="text-sm">{block.content.caption || "No caption"}</span>
        </div>
      )
    case "gallery":
      return (
        <span className="text-sm text-slate-500">
          {block.content.images?.length || 0} images
        </span>
      )
    case "link":
      return (
        <span className="text-sm text-indigo-600">
          {block.content.description} -- {block.content.label || "Untitled link"}
        </span>
      )
    case "diagram":
      return <span>{block.content.title || "Untitled diagram"}</span>
    case "note":
      return <span>{block.content.text || "Empty note"}</span>
    default:
      return null
  }
}

export default BlockEditor