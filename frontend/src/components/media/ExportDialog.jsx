import { useState, useEffect } from "react"
import { X, Download, FileText, CheckSquare, Square } from "lucide-react"
import Button from "../ui/Button"
import { exportToCSV, exportToJSON, downloadFile, getExportFields, generateFilename } from "../../utils/exportUtils"
import { toast } from "../ui/Toast"

export default function ExportDialog({ isOpen, onClose, data, section }) {
  const [format, setFormat] = useState("csv")
  const [selectedFields, setSelectedFields] = useState(new Set())
  const availableFields = getExportFields()

  // Select all fields by default when dialog opens
  useEffect(() => {
    if (isOpen) {
      const allFieldKeys = new Set(availableFields.map(f => f.key))
      setSelectedFields(allFieldKeys)
    }
  }, [isOpen])

  const handleToggleField = (fieldKey) => {
    setSelectedFields(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey)
      } else {
        newSet.add(fieldKey)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      const allFieldKeys = new Set(availableFields.map(f => f.key))
      setSelectedFields(allFieldKeys)
    } else {
      setSelectedFields(new Set())
    }
  }

  const handleExport = () => {
    if (selectedFields.size === 0) {
      toast.warning("Please select at least one field to export")
      return
    }

    const fieldsToExport = availableFields.filter(f => selectedFields.has(f.key))
    const filename = generateFilename(section, format)
    
    let content
    let mimeType
    
    if (format === "csv") {
      content = exportToCSV(data, fieldsToExport)
      mimeType = "text/csv;charset=utf-8;"
    } else {
      content = exportToJSON(data, fieldsToExport)
      mimeType = "application/json;charset=utf-8;"
    }
    
    downloadFile(content, filename, mimeType)
    onClose()
  }

  if (!isOpen) return null

  const allSelected = selectedFields.size === availableFields.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Export Media Data</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Download your collection in CSV or JSON format</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
              Export Format
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat("csv")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  format === "csv"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-slate-900 dark:text-white">CSV</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Spreadsheet compatible</p>
              </button>
              <button
                onClick={() => setFormat("json")}
                className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                  format === "json"
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-slate-900 dark:text-white">JSON</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Developer friendly</p>
              </button>
            </div>
          </div>

          {/* Field Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Select Fields to Export
              </label>
              <button
                onClick={() => handleSelectAll(!allSelected)}
                className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>Select All</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl max-h-64 overflow-y-auto">
              {availableFields.map(field => (
                <button
                  key={field.key}
                  onClick={() => handleToggleField(field.key)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors text-left"
                >
                  {selectedFields.has(field.key) ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-sm text-slate-700 dark:text-slate-300">{field.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">Export Details</p>
                <p>• {data.length} items will be exported</p>
                <p>• {selectedFields.size} fields selected</p>
                <p>• Format: {format.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {selectedFields.size} of {availableFields.length} fields selected
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleExport} disabled={selectedFields.size === 0}>
              <Download className="w-4 h-4 mr-2" />
              Download {format.toUpperCase()}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
