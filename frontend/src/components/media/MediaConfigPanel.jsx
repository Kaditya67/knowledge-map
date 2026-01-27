import { useState } from "react"
import { Plus, Trash2, X } from "lucide-react"
import Button from "../ui/Button"
import Input from "../ui/Input"

export default function MediaConfigPanel({ config, onUpdate }) {
  const [types, setTypes] = useState(config.customTypes || [])
  const [statuses, setStatuses] = useState(config.customStatuses || [])

  const handleAddType = () => {
    setTypes([...types, { name: "New Section", unit: "Ep", totalLabel: "Total Episodes" }])
  }

  const handleUpdateType = (index, field, value) => {
    const newTypes = [...types]
    newTypes[index][field] = value
    setTypes(newTypes)
  }

  const handleDeleteType = (index) => {
    setTypes(types.filter((_, i) => i !== index))
  }

  const handleAddStatus = () => {
    // Generate a simple value from label usually, but for new one just random
    setStatuses([...statuses, { value: `custom_${Date.now()}`, label: "New Status", color: "#64748b" }])
  }

  const handleUpdateStatus = (index, field, value) => {
    const newStatuses = [...statuses]
    newStatuses[index][field] = value
    if (field === "label") {
        newStatuses[index].value = value.toLowerCase().replace(/\s+/g, "_")
    }
    setStatuses(newStatuses)
  }

  const handleDeleteStatus = (index) => {
    setStatuses(statuses.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    onUpdate({
        customTypes: types,
        customStatuses: statuses
    })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Types Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Custom Sections</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Define your tracking libraries (e.g., Anime, Podcast).</p>
            </div>
            <Button size="sm" onClick={handleAddType}><Plus className="w-4 h-4 mr-2" />Add Section</Button>
        </div>
        
        <div className="space-y-4">
            {types.map((type, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                    <div className="md:col-span-4">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Section Name</label>
                        <Input 
                            value={type.name} 
                            onChange={(e) => handleUpdateType(index, "name", e.target.value)}
                            placeholder="e.g. Anime"
                        />
                    </div>
                    <div className="md:col-span-3">
                         <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Unit (Short)</label>
                        <Input 
                            value={type.unit} 
                            onChange={(e) => handleUpdateType(index, "unit", e.target.value)}
                            placeholder="e.g. Ep"
                        />
                    </div>
                    <div className="md:col-span-4">
                         <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Total Label</label>
                        <Input 
                            value={type.totalLabel} 
                            onChange={(e) => handleUpdateType(index, "totalLabel", e.target.value)}
                            placeholder="e.g. Total Episodes"
                        />
                    </div>
                    <div className="md:col-span-1 flex justify-end pb-1">
                        <button onClick={() => handleDeleteType(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>

       {/* Statuses Section */}
       <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Custom Statuses</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Define stages of progress.</p>
            </div>
            <Button size="sm" onClick={handleAddStatus}><Plus className="w-4 h-4 mr-2" />Add Status</Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {statuses.map((status, index) => (
                <div key={index} className="flex gap-3 items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                     <input 
                        type="color" 
                        value={status.color} 
                        onChange={(e) => handleUpdateStatus(index, "color", e.target.value)}
                        className="w-10 h-10 rounded-lg border-0 p-0 overflow-hidden cursor-pointer"
                     />
                     <div className="flex-1">
                        <Input 
                            value={status.label} 
                            onChange={(e) => handleUpdateStatus(index, "label", e.target.value)}
                            placeholder="Status Name"
                        />
                     </div>
                     <button onClick={() => handleDeleteStatus(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
      </div>

      <div className="flex justify-end">
          <Button size="lg" onClick={handleSave}>
              <Save className="w-5 h-5 mr-2" />
              Save Configuration
          </Button>
      </div>
    </div>
  )
}
