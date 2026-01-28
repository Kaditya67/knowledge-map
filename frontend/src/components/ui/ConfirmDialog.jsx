import { X, AlertTriangle } from "lucide-react"
import Button from "../ui/Button"

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = "danger" }) {
  if (!isOpen) return null

  const iconColors = {
    danger: "text-red-500 bg-red-50 dark:bg-red-500/10",
    warning: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
    info: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconColors[type]}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {title}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
          <Button 
            variant="secondary" 
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant={type === "danger" ? "danger" : "primary"}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {type === "danger" ? "Delete" : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  )
}
