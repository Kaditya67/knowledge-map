import { useState, useEffect } from "react"
import { X, Save, Star, Plus, Trash2, Globe, Sparkles } from "lucide-react"
import Button from "../ui/Button"
import Input from "../ui/Input"
import Select from "../ui/Select"
import api from "../../services/api"

export default function MediaDialog({ isOpen, onClose, onSave, initialData, config, allProviders = [] }) {
  const [formData, setFormData] = useState({
    title: "",
    type: config?.customTypes?.[0]?.name || "Manhwa",
    link: "",
    provider: "",
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
  const [isAddingNewProvider, setIsAddingNewProvider] = useState(false)
  const [newProviderInput, setNewProviderInput] = useState("")
  const [availableProviders, setAvailableProviders] = useState([])

  // Default known providers list
  const DEFAULT_PROVIDERS = [
    "Asura Scans",
    "Thunder Scans",
    "MangaPark",
    "Webtoons",
    "ToonGod",
    "Reaper Scans",
    "Flame Comics",
    "MangaDex",
    "HiAnime",
    "Crunchyroll",
    "Netflix"
  ]

  // Fetch or combine providers
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const list = await api.getProviders()
        const names = list.map(p => p.displayName || p.name)
        const combined = Array.from(new Set([...DEFAULT_PROVIDERS, ...names, ...allProviders])).filter(Boolean).sort()
        setAvailableProviders(combined)
      } catch {
        const combined = Array.from(new Set([...DEFAULT_PROVIDERS, ...allProviders])).filter(Boolean).sort()
        setAvailableProviders(combined)
      }
    }
    if (isOpen) {
      fetchProviders()
    }
  }, [isOpen, allProviders])

  // Get current type config
  const currentTypeConfig = config?.customTypes?.find(t => t.name === formData.type) || { unit: "Chapter/Episode", totalLabel: "Total Units" }

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        type: initialData.type || config?.customTypes?.[0]?.name || "Manhwa",
        provider: initialData.provider || "",
        genres: initialData.genres || [],
        tags: initialData.tags || [],
        favorite: initialData.favorite || false,
        coverImage: initialData.coverImage || "",
        notes: initialData.notes || "",
        current: initialData.current !== undefined ? initialData.current : 0,
        total: initialData.total !== undefined ? initialData.total : 0,
        status: initialData.status || config?.customStatuses?.[0]?.value || "planning",
        rating: initialData.rating !== undefined ? initialData.rating : ""
      })
    } else {
      setFormData({
        title: "",
        type: config?.customTypes?.[0]?.name || "Manhwa",
        link: "",
        provider: "",
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
    setIsAddingNewProvider(false)
    setNewProviderInput("")
  }, [initialData, isOpen, config])

  if (!isOpen) return null

  // Auto-detect provider when link changes
  const handleLinkChange = (newLink) => {
    const updates = { link: newLink }
    if (!formData.provider || formData.provider === "Other / Custom") {
      const l = newLink.toLowerCase()
      if (l.includes("asura")) updates.provider = "Asura Scans"
      else if (l.includes("thunder")) updates.provider = "Thunder Scans"
      else if (l.includes("mangapark")) updates.provider = "MangaPark"
      else if (l.includes("webtoon")) updates.provider = "Webtoons"
      else if (l.includes("toongod")) updates.provider = "ToonGod"
      else if (l.includes("reaper")) updates.provider = "Reaper Scans"
      else if (l.includes("flame")) updates.provider = "Flame Comics"
      else if (l.includes("mangadex")) updates.provider = "MangaDex"
      else if (l.includes("hianime") || l.includes("aniwatch")) updates.provider = "HiAnime"
      else if (l.includes("crunchyroll")) updates.provider = "Crunchyroll"
      else if (l.includes("netflix")) updates.provider = "Netflix"
    }
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleProviderSelectChange = (e) => {
    const val = e.target.value
    if (val === "__ADD_NEW__") {
      setIsAddingNewProvider(true)
    } else {
      setIsAddingNewProvider(false)
      setFormData(prev => ({ ...prev, provider: val }))
    }
  }

  const handleAddNewProvider = () => {
    const trimmed = newProviderInput.trim()
    if (!trimmed) return
    if (!availableProviders.includes(trimmed)) {
      setAvailableProviders(prev => [...prev, trimmed].sort())
    }
    setFormData(prev => ({ ...prev, provider: trimmed }))
    setIsAddingNewProvider(false)
    setNewProviderInput("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  const addGenre = () => {
    if (genreInput.trim() && !formData.genres.includes(genreInput.trim())) {
      setFormData(prev => ({ ...prev, genres: [...prev.genres, genreInput.trim()] }))
      setGenreInput("")
    }
  }

  const removeGenre = (genre) => {
    setFormData(prev => ({ ...prev, genres: prev.genres.filter(g => g !== genre) }))
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput("")
    }
  }

  const removeTag = (tag) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const typeOptions = config?.customTypes?.map(t => ({ value: t.name, label: t.name })) || []
  const statusOptions = config?.customStatuses?.map(s => ({ value: s.value, label: s.label })) || []

  // Ensure current provider is represented in options
  const providerOptions = [
    { value: "", label: "-- Select Provider --" },
    ...availableProviders.map(p => ({ value: p, label: p })),
    ...(formData.provider && !availableProviders.includes(formData.provider)
      ? [{ value: formData.provider, label: formData.provider }]
      : []),
    { value: "__ADD_NEW__", label: "➕ + Add New Provider..." }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{initialData?._id ? "Edit Media" : "Add New Media"}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage title, streaming/reading link, provider source and progress
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Title & Favorite */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                label="Media Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Solo Leveling, Tower of God, Jujutsu Kaisen..."
              />
            </div>
            <div className="pb-0.5">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, favorite: !formData.favorite })}
                className={`p-2.5 rounded-xl border-2 transition-all flex items-center justify-center ${
                  formData.favorite
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-500"
                    : "border-slate-200 dark:border-slate-700 hover:border-amber-300 text-slate-400"
                }`}
                title="Mark as favorite"
              >
                <Star className={`w-5 h-5 ${formData.favorite ? "fill-amber-500 text-amber-500" : ""}`} />
              </button>
            </div>
          </div>

          {/* Grid Layout: 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Left Column: Classification & Links */}
            <div className="space-y-4">
              <Select
                label="Category / Section"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                options={typeOptions}
              />

              <Input
                label="Source / Reader URL"
                value={formData.link}
                onChange={e => handleLinkChange(e.target.value)}
                placeholder="https://asuracomic.net/series/..."
                helperText="Auto-identifies known scan and streaming providers"
              />

              {/* Provider Selection & Quick Add */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Content Provider / Scan Site
                </label>
                
                {!isAddingNewProvider ? (
                  <div className="space-y-2">
                    <select
                      value={formData.provider || ""}
                      onChange={handleProviderSelectChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors cursor-pointer"
                    >
                      {providerOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {formData.provider && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Selected Provider: <strong>{formData.provider}</strong></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl space-y-2 animate-fade-in">
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      Add New Provider to List:
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. MangaPlus, Void Scans..."
                        value={newProviderInput}
                        onChange={e => setNewProviderInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                        autoFocus
                      />
                      <Button type="button" size="sm" onClick={handleAddNewProvider}>
                        Add
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsAddingNewProvider(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Cover Image URL (Optional)"
                value={formData.coverImage}
                onChange={e => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://.../cover.jpg"
              />
            </div>

            {/* Right Column: Progress & Status */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={`${currentTypeConfig.unit || "Unit"} Progress`}
                  type="number"
                  min="0"
                  value={formData.current}
                  onChange={e => setFormData({ ...formData, current: Number(e.target.value) })}
                />
                <Input
                  label={currentTypeConfig.totalLabel || "Total Units"}
                  type="number"
                  min="0"
                  value={formData.total}
                  onChange={e => setFormData({ ...formData, total: Number(e.target.value) })}
                  placeholder="0 (ongoing)"
                />
              </div>

              <Select
                label="Reading / Watching Status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                options={statusOptions}
              />

              <Input
                label="Rating Score (0 to 10)"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.rating}
                onChange={e => setFormData({ ...formData, rating: e.target.value })}
                placeholder="8.5"
              />

              {/* Cover Preview if exists */}
              {formData.coverImage && (
                <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <div className="w-12 h-14 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                    <img
                      src={formData.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Cover Image Loaded</span>
                    <p className="truncate max-w-[200px]">{formData.coverImage}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Genres Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Genres
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={genreInput}
                onChange={e => setGenreInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addGenre())}
                placeholder="Add genre (Action, Fantasy, Romance...)"
                className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
              />
              <Button type="button" size="sm" onClick={addGenre}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {formData.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.genres.map(genre => (
                  <span
                    key={genre}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 rounded-lg text-xs font-medium"
                  >
                    {genre}
                    <button type="button" onClick={() => removeGenre(genre)} className="hover:text-indigo-900 dark:hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Custom Tags
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tag (Must Read, Top Tier, Binge...)"
                className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors"
              />
              <Button type="button" size="sm" variant="secondary" onClick={addTag}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 rounded-lg text-xs font-medium"
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-emerald-900 dark:hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Private Notes & Thoughts
            </label>
            <textarea
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition-colors h-20 resize-none"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Chapter notes, where I left off, character reminders..."
            />
          </div>
        </form>

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
