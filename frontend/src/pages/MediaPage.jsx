import { useState, useEffect } from "react"
import { Plus, Film, Book, MonitorPlay, ExternalLink, Edit, Trash2, Play, Settings, LayoutGrid, List, BarChart3, FileText, ChevronDown, AlertTriangle, X, Filter, CheckSquare, Square, Download } from "lucide-react"
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
import ExportDialog from "../components/media/ExportDialog"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import { toast, ToastContainer } from "../components/ui/Toast"

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
  const [showExport, setShowExport] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  // Selection mode for Smart Edit
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedItems, setSelectedItems] = useState(new Set())
  
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

  // Calculate active filter count
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search" && value) return true
    if (key === "status" && value !== "all") return true
    if (key === "favorite" && value) return true
    if ((key === "genres" || key === "tags") && value.length > 0) return true
    if ((key === "minRating" || key === "maxRating") && value) return true
    return false
  }).length


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
        // Prefer 'Manhwa' as default, otherwise use first type
        const manhwaType = configData.customTypes.find(t => t.name === 'Manhwa')
        setActiveSection(manhwaType ? manhwaType.name : configData.customTypes[0].name)
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
      toast.error("Failed to save configuration")
    }
  }

  const handleSaveSection = async (sectionData) => {
    if (!config) return
    
    const newConfig = { ...config }
    newConfig.customTypes = [...(newConfig.customTypes || []), sectionData]
    
    await handleConfigUpdate(newConfig)
    setShowSectionDialog(false)
    setActiveSection(sectionData.name)
    toast.success(`Section "${sectionData.name}" saved successfully`)
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
      toast.success(editingItem ? "Item updated successfully" : "Item created successfully")
    } catch (error) {
      toast.error("Failed to save media")
    }
  }

  const handleDelete = (item) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Item",
      message: `Are you sure you want to delete "${item.title}"?`,
      onConfirm: async () => {
        try {
          await api.deleteMedia(item._id)
          fetchMedia()
          toast.success("Item deleted successfully")
        } catch (error) {
          toast.error("Failed to delete item")
        }
      }
    })
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
      console.error("Failed to update progress", error)
      toast.error("Failed to update progress")
    }
  }

  const handleToggleFavorite = async (item) => {
    try {
      await api.updateMedia(item._id, { favorite: !item.favorite })
      fetchMedia()
    } catch (error) {
      console.error("Failed to toggle favorite", error)
      toast.error("Failed to toggle favorite")
    }
  }

  const handleSmartEditSave = async (items) => {
    try {
      // Separate new items (no _id) from existing items (has _id)
      const newItems = items.filter(item => !item._id)
      const existingItems = items.filter(item => item._id)
      
      let createdCount = 0
      let updatedCount = 0
      let skippedCount = 0
      const errors = []
      
      // Create new items
      for (const item of newItems) {
        try {
          // Check if item with same title already exists
          const duplicate = media.find(m => 
            m.title.toLowerCase() === item.title.toLowerCase() && 
            m.type === item.type
          )
          
          if (duplicate) {
            skippedCount++
            errors.push(`"${item.title}" already exists`)
          } else {
            await api.createMedia(item)
            createdCount++
          }
        } catch (error) {
          console.error('Error creating item:', error)
          errors.push(`Failed to create "${item.title}": ${error.message}`)
        }
      }
      
      // Update existing items
      if (existingItems.length > 0) {
        try {
          await api.batchUpdateMedia(existingItems)
          updatedCount = existingItems.length
        } catch (error) {
          console.error('Error updating items:', error)
          errors.push(`Failed to update items: ${error.message}`)
        }
      }
      
      // Show results
      const messages = []
      if (createdCount > 0) messages.push(`Created ${createdCount} item(s)`)
      if (updatedCount > 0) messages.push(`Updated ${updatedCount} item(s)`)
      if (skippedCount > 0) messages.push(`Skipped ${skippedCount} duplicate(s)`)
      
      if (messages.length > 0) {
        toast.success(messages.join(' • '))
      }
      
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error))
      }
      
      // Refresh media list
      await fetchMedia()
      setShowSmartEdit(false)
    } catch (error) {
      console.error("Failed to save items", error)
      toast.error("Failed to save changes: " + error.message)
    }
  }

  const handleBatchDelete = () => {
    if (selectedItems.size === 0) return

    setConfirmDialog({
      isOpen: true,
      title: "Delete Multiple Items",
      message: `Are you sure you want to delete ${selectedItems.size} selected items? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          // Identify items to delete
          const itemIdsToDelete = Array.from(selectedItems)
          const itemsToDelete = filteredMedia.filter(item => selectedItems.has(item._id))
          
          let successCount = 0
          let failCount = 0
          
          // Delete items one by one (since no batch delete API)
          for (const id of itemIdsToDelete) {
            try {
              await api.deleteMedia(id)
              successCount++
            } catch (error) {
              console.error(`Failed to delete item ${id}`, error)
              failCount++
            }
          }
          
          if (successCount > 0) {
            toast.success(`Successfully deleted ${successCount} items`)
          }
          
          if (failCount > 0) {
            toast.error(`Failed to delete ${failCount} items`)
          }
          
          handleExitSelectionMode()
          fetchMedia()
        } catch (error) {
          toast.error("Failed to process batch deletion")
        }
      }
    })
  }

  // Selection mode handlers
  const handleEnterSelectionMode = () => {
    setSelectionMode(true)
    // Select all filtered items by default
    const allIds = new Set(filteredMedia.map(item => item._id))
    setSelectedItems(allIds)
  }

  const handleExitSelectionMode = () => {
    setSelectionMode(false)
    setSelectedItems(new Set())
  }

  const handleToggleSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(filteredMedia.map(item => item._id))
      setSelectedItems(allIds)
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleOpenSmartEdit = () => {
    const itemsToEdit = filteredMedia.filter(item => selectedItems.has(item._id))
    if (itemsToEdit.length > 0) {
      setShowSmartEdit(true)
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

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading media library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1920px] mx-auto h-[calc(100vh-60px)] flex flex-col gap-3 p-4 md:p-6">
      {/* Ultra Compact Header - Single Line */}
      <div className="flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Media Library</h1>
          
          {/* Section Selector - Compact Dropdown */}
          {viewMode === "library" && customTypes.length > 0 && (
            <div className="relative">
              <select
                value={activeSection || ""}
                onChange={(e) => setActiveSection(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:border-indigo-500 dark:hover:border-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 outline-none transition-colors cursor-pointer"
              >
                {customTypes.map(type => (
                  <option key={type.name} value={type.name}>
                    {type.name} ({media.filter(m => m.type === type.name).length})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
        
        {/* View Mode Tabs + Filter Button */}
        <div className="flex items-center gap-2">
          {viewMode === "library" && !selectionMode && (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  showFilters || activeFilterCount > 0
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-[10px] font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              {user && (
                <>
                  <button
                    onClick={handleEnterSelectionMode}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Batch Edit</span>
                  </button>
                  
                  <button
                    onClick={() => setShowExport(true)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    disabled={filteredMedia.length === 0}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </>
              )}
            </>
          )}
          
          {user && (
            <div className="bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg flex items-center gap-0.5">
              <button 
                onClick={() => setViewMode("library")}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  viewMode === "library"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Library</span>
              </button>
              <button 
                onClick={() => setViewMode("stats")}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  viewMode === "stats"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Stats</span>
              </button>
              <button 
                onClick={() => setViewMode("manage")}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  viewMode === "manage"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Manage</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Selection Mode Toolbar */}
      {selectionMode && viewMode === "library" && (
        <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 rounded-xl p-3 flex items-center justify-between shrink-0 animate-fade-in">
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleSelectAll(selectedItems.size !== filteredMedia.length)}
              className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 transition-colors"
            >
              {selectedItems.size === filteredMedia.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>Select All</span>
            </button>
            <div className="h-4 w-px bg-indigo-300 dark:bg-indigo-700"></div>
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              {selectedItems.size} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExitSelectionMode}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={selectedItems.size === 0}
              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete ({selectedItems.size})
            </button>
            <button
              onClick={handleOpenSmartEdit}
              disabled={selectedItems.size === 0}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              Edit Selected
            </button>
          </div>
        </div>
      )}

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
        <div className="flex-1 flex flex-col overflow-hidden animate-fade-in relative">
          {/* Filters Dropdown - Positioned Absolutely */}
          {showFilters && (
            <div className="absolute top-0 left-0 right-0 z-20 animate-fade-in">
              <MediaFilters
                onFilterChange={setFilters}
                config={config}
                allGenres={allGenres}
                allTags={allTags}
              />
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white dark:bg-slate-800 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{activeSection}</h2>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md text-[10px] font-semibold text-slate-500">
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
                    >
                      <FileText className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Smart Add</span>
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
                      selectionMode={selectionMode}
                      isSelected={selectedItems.has(item._id)}
                      onSelect={() => handleToggleSelection(item._id)}
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

      {/* Smart Edit Dialog - handles both Smart Add (empty) and Batch Edit (selected items) */}
      <SmartEditDialog
        isOpen={showSmartEdit}
        onClose={() => setShowSmartEdit(false)}
        onSave={(items) => {
          handleSmartEditSave(items)
          handleExitSelectionMode()
        }}
        items={selectionMode ? filteredMedia.filter(item => selectedItems.has(item._id)) : []}
        config={config}
        defaultType={activeSection || config?.customTypes?.[0]?.name}
      />

      {/* Export Dialog */}
      <ExportDialog
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        data={filteredMedia}
        section={activeSection || "All"}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  )
}
