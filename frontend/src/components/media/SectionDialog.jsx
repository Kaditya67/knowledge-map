import { useState, useEffect } from "react"
import { X, Save } from "lucide-react"
import Button from "../ui/Button"
import Input from "../ui/Input"

export default function SectionDialog({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({
    name: "",
    unit: "Ep",
    totalLabel: "Total Episodes"
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        name: "",
        unit: "Ep",
        totalLabel: "Total Episodes"
      })
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {initialData ? "Edit Section" : "Add New Section"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
           <Input 
                label="Section Name" 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Podcast, Webtoon"
                required
            />
            
            <div className="grid grid-cols-2 gap-4">
                <Input 
                    label="Unit (Short)" 
                    value={formData.unit} 
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. Ep, Ch"
                />
                 <Input 
                    label="Total Label" 
                    value={formData.totalLabel} 
                    onChange={e => setFormData({ ...formData, totalLabel: e.target.value })}
                    placeholder="e.g. Total Eps"
                />
            </div>

            <div className="flex justify-end pt-4">
                <Button onClick={handleSubmit}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Section
                </Button>
            </div>
        </form>
      </div>
    </div>
  )
}
