import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Select from "../components/ui/Select"
import { Settings, Save, Layout, Layers, Palette, Check } from "lucide-react"

function SettingsPage() {
  const { user, updatePreferences } = useAuth()
  
  const [preferences, setPreferences] = useState({
    cardsPerPage: 20,
    defaultViewMode: "grid",
    customCategories: ["concept", "setup", "project", "custom"],
    accentColor: "indigo",
    colorMode: "system"
  })
  
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    if (user?.preferences) {
      setPreferences({
        cardsPerPage: user.preferences.cardsPerPage || 20,
        defaultViewMode: user.preferences.defaultViewMode || "grid",
        customCategories: user.preferences.customCategories?.length 
          ? user.preferences.customCategories 
          : ["concept", "setup", "project", "custom"],
        accentColor: user.preferences.accentColor || "indigo",
        colorMode: user.preferences.colorMode || "system"
      })
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setSuccessMsg("")
    try {
      await updatePreferences(preferences)
      setSuccessMsg("Settings saved successfully!")
      setTimeout(() => setSuccessMsg(""), 3000)
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleCategoryChange = (e) => {
    const val = e.target.value
    const cats = val.split(",").map(c => c.trim()).filter(Boolean)
    setPreferences({ ...preferences, customCategories: cats })
  }

  if (!user) {
    return <div className="p-8">Please log in to view settings.</div>
  }

  return (
    <div className="w-full max-w-screen-md mx-auto py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Settings className="w-6 h-6 text-indigo-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Customize your preferences</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <Layout className="w-5 h-5 text-slate-400" />
          Display & Layout
        </h2>
        
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input 
              type="number"
              label="Cards Per Page"
              value={preferences.cardsPerPage}
              onChange={(e) => setPreferences({ ...preferences, cardsPerPage: parseInt(e.target.value) || 20 })}
              min="1"
              max="100"
            />
            <Select
              label="Default View Mode"
              value={preferences.defaultViewMode}
              onChange={(e) => setPreferences({ ...preferences, defaultViewMode: e.target.value })}
              options={[
                { value: "grid", label: "Grid View" },
                { value: "list", label: "List View" }
              ]}
            />
            <Select
              label="Color Mode"
              value={preferences.colorMode}
              onChange={(e) => setPreferences({ ...preferences, colorMode: e.target.value })}
              options={[
                { value: "system", label: "System Default" },
                { value: "light", label: "Light Mode" },
                { value: "dark", label: "Dark Mode" }
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme Color
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "indigo", color: "#6366f1" },
                { id: "rose", color: "#f43f5e" },
                { id: "emerald", color: "#10b981" },
                { id: "violet", color: "#8b5cf6" }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setPreferences({ ...preferences, accentColor: theme.id })}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ${
                    preferences.accentColor === theme.id ? "ring-2 ring-offset-2 dark:ring-offset-slate-800 ring-slate-400 scale-110" : ""
                  }`}
                  style={{ backgroundColor: theme.color }}
                  title={theme.id}
                >
                  {preferences.accentColor === theme.id && <Check className="w-5 h-5 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <Layers className="w-5 h-5 text-slate-400" />
          Content Organization
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Custom Categories (comma separated)
            </label>
            <textarea
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
              value={preferences.customCategories.join(", ")}
              onChange={handleCategoryChange}
              rows={3}
              placeholder="concept, setup, project, tutorial, quick-note..."
            />
            <p className="text-xs text-slate-500 mt-2">
              These will be available as "Type" options when creating or editing pages.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-green-500 font-medium">{successMsg}</span>
        <Button onClick={handleSave} disabled={saving} variant="primary">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}

export default SettingsPage
