import { useState, useEffect } from "react"
import { X, Save, Star, Plus, Trash2 } from "lucide-react"
import Button from "../ui/Button"
import Input from "../ui/Input"
import Select from "../ui/Select"

export default function MediaDialog({ isOpen, onClose, onSave, initialData, config }) {
  const [formData, setFormData] = useState({
    title: "",
    type: config?.customTypes?.[0]?.name || "Anime",
    link: "",
    current: 0,
    total: 0,
    status: config?.customStatuses?.[0]?.value || "planning",
    rating: "",
    notes: "",
    genres: [],
    tags: [],
    favorite: false,
    coverImage: ""
  })

  const [genreInput, setGenreInput] = useState("")
  const [tagInput, setTagInput] = useState("")

  // Get current type config
  const currentTypeConfig = config?.customTypes?.find(t => t.name === formData.type) || { unit: "Progress", totalLabel: "Total" }

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        genres: initialData.genres || [],
        tags: initialData.tags || [],
        favorite: initialData.favorite || false,
        coverImage: initialData.coverImage || ""
      })
    } else {
      setFormData({
        title: "",
        type: config?.customTypes?.[0]?.name || "Anime",
        link: "",
        current: 0,
        total: 0,
        status: config?.customStatuses?.[0]?.value || "planning",
        rating: "",
        notes: "",
        genres: [],
        tags: [],
        favorite: false,
        coverImage: ""
      })
    }
  }, [initialData, isOpen, config])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const addGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData({ ...formData, genres: [...formData.genres, genreInput.trim()] })
      setGenreInput("")
    }
  }

  const removeGenre = (genre) => {
    setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre) })
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const typeOptions = config?.customTypes?.map(t => ({ value: t.name, label: t.name })) || []
  const statusOptions = config?.customStatuses?.map(s => ({ value: s.value, label: s.label })) || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {initialData ? "Edit Media" : "Add Media"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Favorite */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Naruto, Solo Leveling..."
              />
            </div>
            <div className="pt-6">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, favorite: !formData.favorite })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  formData.favorite
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-amber-300"
                }`}
                title="Mark as favorite"
              >
                <Star className={`w-5 h-5 ${formData.favorite ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              <Select
                label="Section"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                options={typeOptions}
              />
              
              <Input
                label="Link / URL"
                value={formData.link}
                onChange={e => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
              />

              <Input
                label="Cover Image URL"
                value={formData.coverImage}
                onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <Input
                  label={`${currentTypeConfig.unit}s Watched/Read`}
                  type="number"
                  min="0"
                  value={formData.current}
                  onChange={e => setFormData({ ...formData, current: Number(e.target.value) })}
                 />
                 <Input
                  label={currentTypeConfig.totalLabel}
                  type="number"
                  min="0"
                  value={formData.total}
                  onChange={e => setFormData({ ...formData, total: Number(e.target.value) })}
                  placeholder="0 for ongoing"
                 />
               </div>

               <Select
                  label="Status"
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  options={statusOptions}
                />

                <Input
                  label="Rating (0-10)"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating}
                  onChange={e => setFormData({ ...formData, rating: e.target.value })}
                />
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Genres</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={genreInput}
                onChange={e => setGenreInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && (e.preventDefault(), addGenre())}
                placeholder="Add genre (e.g., Action, Fantasy)"
                className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors dark:text-white"
              />
              <button
                type="button"
                onClick={addGenre}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.genres.map(genre => (
                  <span
                    key={genre}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium"
                  >
                    {genre}
                    <button type="button" onClick={() => removeGenre(genre)} className="hover:text-indigo-800 dark:hover:text-indigo-200">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tag (e.g., Must Watch, Recommended)"
                className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors dark:text-white"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-emerald-800 dark:hover:text-emerald-200">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
            <textarea
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors h-24 resize-none dark:text-white"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Private notes..."
            />
          </div>
        </form>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Save Media
          </Button>
        </div>
      </div>
    </div>
  )
}
