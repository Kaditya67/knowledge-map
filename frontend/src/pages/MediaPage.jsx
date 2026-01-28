import { useState, useEffect } from "react"
import { Plus, Film, Book, MonitorPlay, ExternalLink, Edit, Trash2, Play, Settings, LayoutGrid, List, BarChart3, FileText, ChevronDown, AlertTriangle, X } from "lucide-react"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import Button from "../components/ui/Button"
import Select from "../components/ui/Select"
import MediaDialog from "../components/media/MediaDialog"
import SectionDialog from "../components/media/SectionDialog"
import MediaCard from "../components/media/MediaCard"
import MediaFilters from "../components/media/MediaFilters"
import MediaStats from "../components/media/MediaStats"
import SmartEditDialog from "../components/media/SmartEditDialog"
import ConfirmDialog from "../components/ui/ConfirmDialog"

export default function MediaPage() {
  const { user } = useAuth()
  const [media, setMedia] = useState([])
  const [filteredMedia, setFilteredMedia] = useState([])
  const [config, setConfig] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("library") // library | manage | stats
  const [activeSection, setActiveSection] = useState(null)
  const [sort, setSort] = useState("updated")
  const [viewLayout, setViewLayout] = useState("grid") // grid | list
  
  const [showDialog, setShowDialog] = useState(false)
  const [showSectionDialog, setShowSectionDialog] = useState(false)
  const [showSmartEdit, setShowSmartEdit] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const [filters, setFilters] = useState({})
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null
  })
  
  // Error message state
  const [errorMessage, setErrorMessage] = useState(null)

  // Extract all unique genres and tags from media
  const allGenres = [...new Set(media.flatMap(m => m.genres || []))].sort()
  const allTags = [...new Set(media.flatMap(m => m.tags || []))].sort()

  const fetchData = async () => {
    try {
      setLoading(true)
      const [mediaData, configData] = await Promise.all([
        api.getMedia({ sort }),
        api.getMediaConfig()
      ])
      setMedia(mediaData)
      setConfig(configData)
      
      if (!activeSection && configData?.customTypes?.length > 0) {
        setActiveSection(configData.customTypes[0].name)
      }
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const statsData = await api.getMediaStats(activeSection)
      setStats(statsData)
    } catch (error) {
      console.error("Failed to fetch stats", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [sort])

  useEffect(() => {
    if (viewMode === "stats" && activeSection) {
      fetchStats()
    }
  }, [viewMode, activeSection])

  // Apply filters locally
  useEffect(() => {
    let result = media.filter(m => m.type === activeSection)
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(m => 
        m.title.toLowerCase().includes(searchLower) ||
        (m.notes && m.notes.toLowerCase().includes(searchLower))
      )
    }
    
    if (filters.status && filters.status !== "all") {
      result = result.filter(m => m.status === filters.status)
    }
    
    if (filters.favorite) {
      result = result.filter(m => m.favorite)
    }
    
    if (filters.genres && filters.genres.length > 0) {
      result = result.filter(m => 
        m.genres && m.genres.some(g => filters.genres.includes(g))
      )
    }
    
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(m => 
        m.tags && m.tags.some(t => filters.tags.includes(t))
      )
    }
    
    if (filters.minRating) {
      result = result.filter(m => m.rating >= Number(filters.minRating))
    }
    
    if (filters.maxRating) {
      result = result.filter(m => m.rating <= Number(filters.maxRating))
    }
    
    setFilteredMedia(result)
  }, [media, activeSection, filters])

  const fetchMedia = () => {
    fetchData()
  }

  const handleConfigUpdate = async (newConfig) => {
    try {
      const updated = await api.updateMediaConfig(newConfig)
      setConfig(updated)
    } catch (error) {
      alert("Failed to save configuration")
    }
  }

  const handleSaveSection = async (sectionData) => {
    if (!config) return
    
    const newConfig = { ...config }
    newConfig.customTypes = [...(newConfig.customTypes || []), sectionData]
    
    await handleConfigUpdate(newConfig)
    setShowSectionDialog(false)
    setActiveSection(sectionData.name)
  }

  const handleDeleteSection = (typeName) => {
    if (!config) return
    
    const itemCount = media.filter(m => m.type === typeName).length
    
    // Prevent deletion if section has items
    if (itemCount > 0) {
      setErrorMessage(`Cannot delete "${typeName}" section because it contains ${itemCount} item(s). Please delete or move all items first.`)
      setTimeout(() => setErrorMessage(null), 5000) // Clear after 5 seconds
      return
    }
    
    // Show confirmation dialog for empty sections
    setConfirmDialog({
      isOpen: true,
      title: "Delete Section",
      message: `Are you sure you want to delete the "${typeName}" section? This action cannot be undone.`,
      onConfirm: async () => {
        const newConfig = { ...config }
        newConfig.customTypes = newConfig.customTypes.filter(t => t.name !== typeName)
        
        await handleConfigUpdate(newConfig)
        
        // If we deleted the active section, switch to the first available one
        if (activeSection === typeName && newConfig.customTypes.length > 0) {
          setActiveSection(newConfig.customTypes[0].name)
        }
      }
    })
  }

  const handleSave = async (data) => {
    try {
      if (editingItem && editingItem._id) {
        await api.updateMedia(editingItem._id, data)
      } else {
        await api.createMedia(data)
      }
      setShowDialog(false)
      setEditingItem(null)
      fetchMedia()
    } catch (error) {
      alert("Failed to save media")
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Delete this item?")) {
      await api.deleteMedia(id)
      fetchMedia()
    }
  }

  const handleIncrement = async (item) => {
    try {
      const next = (item.current || 0) + 1
      const updates = { current: next }
      if (item.total > 0 && next >= item.total) {
        updates.status = "completed"
      } else if (item.status === "planning") {
        updates.status = "in_progress"
      }
      await api.updateMedia(item._id, updates)
      fetchMedia()
    } catch (error) {
      console.error("Failed to update progress")
    }
  }

  const handleToggleFavorite = async (item) => {
    try {
      await api.updateMedia(item._id, { favorite: !item.favorite })
      fetchMedia()
    } catch (error) {
      console.error("Failed to toggle favorite")
    }
  }

  const handleSmartEditSave = async (items) => {
    try {
      await api.batchUpdateMedia(items)
      fetchMedia()
    } catch (error) {
      console.error("Failed to save batch updates", error)
      alert("Failed to save changes")
    }
  }

  const getTypeIcon = (type) => {
    const lower = type.toLowerCase()
    if (lower.includes("anime") || lower.includes("film") || lower.includes("movie")) return <Film className="w-4 h-4" />
    if (lower.includes("book") || lower.includes("manga") || lower.includes("manhwa")) return <Book className="w-4 h-4" />
    if (lower.includes("video")) return <MonitorPlay className="w-4 h-4" />
    return <ExternalLink className="w-4 h-4" />
  }

  const sortOptions = [
    { value: "updated", label: "Recently Updated" },
    { value: "newest", label: "Recently Added" },
    { value: "rating", label: "Rating (High to Low)" },
    { value: "title", label: "Title (A-Z)" }
  ]

  const customTypes = config?.customTypes || []
  const sectionCount = media.filter(m => m.type === activeSection).length

  return (
    <div className="max-w-[1920px] mx-auto h-[calc(100vh-60px)] flex flex-col gap-4 p-4 md:p-6">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Media Library</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Track your collections</p>
          </div>
          
          {/* Section Selector - Compact Dropdown */}
          {viewMode === "library" && customTypes.length > 0 && (
            <div className="relative">
              <select
                value={activeSection || ""}
                onChange={(e) => setActiveSection(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white hover:border-indigo-500 dark:hover:border-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors cursor-pointer"
              >
                {customTypes.map(type => (
                  <option key={type.name} value={type.name}>
                    {type.name} ({media.filter(m => m.type === type.name).length})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
        
        {/* View Mode Tabs */}
        {user && (
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1">
            <button 
              onClick={() => setViewMode("library")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                viewMode === "library"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </button>
            <button 
              onClick={() => setViewMode("stats")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                viewMode === "stats"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Stats</span>
            </button>
            <button 
              onClick={() => setViewMode("manage")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                viewMode === "manage"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Manage</span>
            </button>
          </div>
        )}
      </div>

      {viewMode === "manage" ? (
        /* MANAGE VIEW */
        <div className="flex-1 overflow-y-auto animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowSectionDialog(true)}
              className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Create New Section</h3>
              <p className="text-xs text-slate-500 text-center mt-1">Define a new collection type</p>
            </button>

            {customTypes.map(type => (
              <div key={type.name} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                    {getTypeIcon(type.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{type.name}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">
                      Unit: {type.unit}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">Total Label</p>
                    <p>{type.totalLabel}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">Items</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{media.filter(m => m.type === type.name).length}</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700 gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteSection(type.name)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === "stats" ? (
        /* STATISTICS VIEW */
        <div className="flex-1 overflow-y-auto animate-fade-in">
          <div className="max-w-6xl mx-auto">
            {/* Section Selector for Stats */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {customTypes.map(type => (
                  <button
                    key={type.name}
                    onClick={() => setActiveSection(type.name)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      activeSection === type.name
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {getTypeIcon(type.name)}
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            <MediaStats stats={stats} loading={loading} />
          </div>
        </div>
      ) : (
        /* LIBRARY VIEW - Full Width */
        <div className="flex-1 flex flex-col gap-4 overflow-hidden animate-fade-in">
          {/* Filters */}
          <MediaFilters
            onFilterChange={setFilters}
            config={config}
            allGenres={allGenres}
            allTags={allTags}
          />

          {/* Content Area */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white dark:bg-slate-800 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeSection}</h2>
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-semibold text-slate-500">
                  {filteredMedia.length} {filteredMedia.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                {/* View Layout Toggle */}
                <div className="bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex">
                  <button
                    onClick={() => setViewLayout("grid")}
                    className={`p-2 rounded ${viewLayout === "grid" ? "bg-white dark:bg-slate-600 shadow-sm" : ""}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewLayout("list")}
                    className={`p-2 rounded ${viewLayout === "list" ? "bg-white dark:bg-slate-600 shadow-sm" : ""}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-40">
                  <Select 
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    options={sortOptions} 
                  />
                </div>
                
                {user && activeSection && (
                  <>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSmartEdit(true)}
                      disabled={filteredMedia.length === 0}
                    >
                      <FileText className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Smart Edit</span>
                    </Button>
                    <Button size="sm" onClick={() => { 
                      setEditingItem({ type: activeSection }); 
                      setShowDialog(true) 
                    }}>
                      <Plus className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Add</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Grid/List Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-black/20">
              {!activeSection ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Film className="w-16 h-16 mb-4 opacity-20" />
                  <p>Select a collection</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p className="mb-4">No items found</p>
                  {user && (
                    <Button variant="ghost" onClick={() => { setEditingItem({ type: activeSection }); setShowDialog(true) }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Item
                    </Button>
                  )}
                </div>
              ) : (
                <div className={viewLayout === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
                  : "space-y-3"
                }>
                  {filteredMedia.map(item => (
                    <MediaCard
                      key={item._id}
                      item={item}
                      config={config}
                      onEdit={(item) => { setEditingItem(item); setShowDialog(true) }}
                      onDelete={handleDelete}
                      onIncrement={handleIncrement}
                      onToggleFavorite={handleToggleFavorite}
                      viewMode={viewLayout}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <MediaDialog 
        isOpen={showDialog} 
        onClose={() => { setShowDialog(false); setEditingItem(null) }} 
        onSave={handleSave}
        initialData={editingItem}
        config={config} 
      />

      <SectionDialog 
        isOpen={showSectionDialog}
        onClose={() => setShowSectionDialog(false)}
        onSave={handleSaveSection}
      />

      <SmartEditDialog
        isOpen={showSmartEdit}
        onClose={() => setShowSmartEdit(false)}
        onSave={handleSmartEditSave}
        items={filteredMedia}
        config={config}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
      />

      {/* Error Message Toast */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold mb-1">Cannot Delete Section</p>
              <p className="text-sm opacity-90">{errorMessage}</p>
            </div>
            <button 
              onClick={() => setErrorMessage(null)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
