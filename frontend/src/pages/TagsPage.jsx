"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, X, Check, Tag } from "lucide-react"
import { useApp } from "../context/AppContext"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"

function TagsPage() {
  const { tags, createTag, updateTag, deleteTag } = useApp()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [newTag, setNewTag] = useState({ name: "", color: "#6366f1" })
  const [editTag, setEditTag] = useState({ name: "", color: "" })

  const colorOptions = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ]

  const handleCreate = async () => {
    if (!newTag.name.trim()) return
    await createTag(newTag)
    setNewTag({ name: "", color: "#6366f1" })
    setIsCreating(false)
  }

  const handleUpdate = async (id) => {
    if (!editTag.name.trim()) return
    await updateTag(id, editTag)
    setEditingId(null)
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      await deleteTag(id)
    }
  }

  const startEdit = (tag) => {
    setEditingId(tag._id)
    setEditTag({ name: tag.name, color: tag.color })
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Tag className="w-8 h-8 text-indigo-500" />
            Tags
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {tags.length} {tags.length === 1 ? "tag" : "tags"} to organize your knowledge
          </p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Tag
          </Button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <Card className="p-5 mb-6" hover>
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <Input
              label="Tag Name"
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              placeholder="Enter tag name"
              className="flex-1"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Color</label>
              <div className="flex gap-1.5 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewTag({ ...newTag, color })}
                    className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 ${
                      newTag.color === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate}>
                <Check className="w-4 h-4" />
              </Button>
              <Button variant="ghost" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tags List */}
      <div className="space-y-3">
        {tags.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
              <Tag className="w-10 h-10 text-indigo-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No tags yet</h2>
            <p className="text-slate-500 dark:text-slate-400">Create your first tag to organize your pages.</p>
          </div>
        ) : (
          tags.map((tag) => (
            <Card key={tag._id} className="p-4" hover>
              {editingId === tag._id ? (
                <div className="flex flex-col sm:flex-row items-end gap-4">
                  <Input
                    value={editTag.name}
                    onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
                    className="flex-1"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setEditTag({ ...editTag, color })}
                        className={`w-6 h-6 rounded-md transition-transform hover:scale-110 ${
                          editTag.color === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(tag._id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-md" style={{ backgroundColor: tag.color }} />
                    <span className="font-medium text-slate-900 dark:text-white">{tag.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(tag)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(tag._id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default TagsPage
