import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Globe,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Film,
  BookOpen,
  Filter,
  BarChart2,
  Sparkles,
  Search,
  Check,
  X,
  Layers
} from "lucide-react"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import { toast, ToastContainer } from "../components/ui/Toast"

export default function ProvidersPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [statsData, setStatsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all")
  
  // Modal / Form state
  const [showDialog, setShowDialog] = useState(false)
  const [editingProvider, setEditingProvider] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    url: "",
    domains: "",
    color: "#6366f1",
    notes: "",
  })

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  })

  const colorPalette = [
    "#6366f1", // Indigo
    "#9333ea", // Purple (Asura)
    "#eab308", // Yellow (Thunder)
    "#f97316", // Orange (MangaPark)
    "#00dc64", // Green (Webtoons)
    "#ec4899", // Pink (ToonGod)
    "#ef4444", // Red (Reaper)
    "#3b82f6", // Blue
    "#06b6d4", // Cyan
    "#14b8a6", // Teal
    "#84cc16", // Lime
    "#64748b", // Slate
  ]

  const fetchProviderStats = async () => {
    try {
      setLoading(true)
      const data = await api.getProviderStats()
      setStatsData(data)
    } catch (err) {
      console.error(err)
      toast.error("Failed to load providers stats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviderStats()
  }, [])

  const handleOpenCreate = () => {
    setEditingProvider(null)
    setFormData({
      name: "",
      displayName: "",
      url: "",
      domains: "",
      color: "#6366f1",
      notes: "",
    })
    setShowDialog(true)
  }

  const handleOpenEdit = (provider) => {
    setEditingProvider(provider)
    setFormData({
      name: provider.name || "",
      displayName: provider.displayName || provider.name || "",
      url: provider.url || "",
      domains: Array.isArray(provider.domains) ? provider.domains.join(", ") : "",
      color: provider.color || "#6366f1",
      notes: provider.notes || "",
    })
    setShowDialog(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Provider name is required")
      return
    }

    try {
      const payload = {
        name: formData.name.trim(),
        displayName: formData.displayName.trim() || formData.name.trim(),
        url: formData.url.trim(),
        domains: formData.domains.split(",").map(d => d.trim()).filter(Boolean),
        color: formData.color,
        notes: formData.notes.trim(),
      }

      if (editingProvider?._id) {
        await api.updateProvider(editingProvider._id, payload)
        toast.success("Provider updated successfully")
      } else {
        await api.createProvider(payload)
        toast.success("Provider created successfully")
      }

      setShowDialog(false)
      fetchProviderStats()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save provider")
    }
  }

  const handleDelete = (provider) => {
    if (!provider._id) {
      toast.error("Auto-detected providers without custom records can't be deleted directly.")
      return
    }

    setConfirmDialog({
      isOpen: true,
      title: `Delete ${provider.displayName || provider.name}?`,
      message: "Are you sure? This will remove the custom provider configuration.",
      onConfirm: async () => {
        try {
          await api.deleteProvider(provider._id)
          toast.success("Provider removed")
          fetchProviderStats()
        } catch (err) {
          toast.error("Failed to delete provider")
        }
      },
    })
  }

  // Filter providers
  const providersList = statsData?.providers || []
  
  // Extract all media types available in stats
  const allMediaTypes = Array.from(
    new Set(providersList.flatMap(p => Object.keys(p.countsByType || {})))
  ).sort()

  const filteredProviders = providersList.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.displayName && p.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.domains && p.domains.some(d => d.toLowerCase().includes(searchQuery.toLowerCase())))

    if (!matchesSearch) return false

    if (selectedTypeFilter !== "all") {
      return (p.countsByType?.[selectedTypeFilter] || 0) > 0
    }

    return true
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Content Providers
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Scan sites & platforms hosting your Anime, Manhwa, Manga, and media
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Button onClick={handleOpenCreate} className="shadow-md shadow-indigo-500/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Provider
            </Button>
          )}
        </div>
      </div>

      {/* Overview Metric Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Providers</span>
            <Globe className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {providersList.length}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Detected across your library
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Linked Items</span>
            <Layers className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {statsData?.totalMediaCount || 0}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Media mapped with sources
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top Provider</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white truncate">
            {providersList[0]?.displayName || providersList[0]?.name || "None"}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {providersList[0] ? `${providersList[0].totalCount} titles tracked` : "No data"}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Media Categories</span>
            <Film className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {allMediaTypes.length}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {allMediaTypes.slice(0, 3).join(", ") || "None"}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search providers or domains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Media type filter pill tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTypeFilter === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All Types
          </button>
          {allMediaTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTypeFilter === type
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading providers and statistics...</p>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Globe className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No providers found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or add custom providers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => {
            const counts = provider.countsByType || {}
            const typeEntries = Object.entries(counts).sort((a, b) => b[1] - a[1])

            return (
              <div
                key={provider.name}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                {/* Top colored accent line */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: provider.color || "#6366f1" }}
                />

                <div className="p-6">
                  {/* Title and icon */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                        style={{ backgroundColor: provider.color || "#6366f1" }}
                      >
                        {provider.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {provider.displayName || provider.name}
                        </h3>
                        {provider.url ? (
                          <a
                            href={provider.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-indigo-500 hover:text-indigo-600 gap-1 mt-0.5"
                          >
                            <span>Visit Site</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {provider.isAutoDetected ? "Auto-detected" : "Custom Provider"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions if logged in */}
                    {user && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(provider)}
                          title="Edit Provider"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {provider._id && (
                          <button
                            onClick={() => handleDelete(provider)}
                            title="Delete Provider"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Provider domains */}
                  {provider.domains && provider.domains.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {provider.domains.map((dom) => (
                        <span
                          key={dom}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-[11px] font-mono text-slate-600 dark:text-slate-400"
                        >
                          {dom}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Breakdown counts per Media Type */}
                  <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      <span>Library Breakdown</span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {provider.totalCount} items
                      </span>
                    </div>

                    {typeEntries.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No media currently tagged with this provider.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {typeEntries.map(([type, count]) => {
                          const percentage = Math.round((count / (provider.totalCount || 1)) * 100)
                          return (
                            <div key={type} className="text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {type}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                  {count} <span className="text-[10px] text-slate-400 font-normal">({percentage}%)</span>
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${percentage}%`,
                                    backgroundColor: provider.color || "#6366f1",
                                  }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer action to jump to Media view filtered by this provider */}
                <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {provider.totalCount} linked titles
                  </span>
                  <button
                    onClick={() => navigate(`/media?provider=${encodeURIComponent(provider.name)}`)}
                    className="inline-flex items-center text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline gap-1"
                  >
                    View in Media
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Provider Modal */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingProvider ? "Edit Provider" : "Add Provider"}
              </h3>
              <button
                onClick={() => setShowDialog(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <Input
                label="Provider Name"
                placeholder="e.g. Asura Scans"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Input
                label="Display Name (Optional)"
                placeholder="e.g. Asura"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />

              <Input
                label="Website URL"
                placeholder="https://asuracomic.net"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />

              <Input
                label="Match Domains (comma separated)"
                placeholder="asuracomic.net, asura.gg"
                value={formData.domains}
                onChange={(e) => setFormData({ ...formData, domains: e.target.value })}
                helperText="Auto-assigns this provider when links contain any of these domains"
              />

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Theme Color
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {colorPalette.map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setFormData({ ...formData, color: col })}
                      className={`w-7 h-7 rounded-lg transition-transform ${
                        formData.color === col ? "scale-110 ring-2 ring-offset-2 ring-indigo-500" : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    title="Custom color"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProvider ? "Save Changes" : "Create Provider"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  )
}
