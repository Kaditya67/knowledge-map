import { useState, useEffect } from "react"
import { X, Save, FileText, AlertCircle, CheckCircle, Code } from "lucide-react"
import Button from "../ui/Button"
import { toast } from "../ui/Toast"

/**
 * SmartEditDialog - Allows bulk editing of media items via markdown format
 * 
 * Format:
 * # Title
 * - Status: planning | in_progress | completed | dropped | paused
 * - Rating: 0-10
 * - Current: 0
 * - Total: 0
 * - Genres: Action, Fantasy, Adventure
 * - Tags: Must Watch, Recommended
 * - Favorite: true | false
 * - Link: https://...
 * - Cover: https://...
 * - Notes: Your notes here
 * ---
 */

export default function SmartEditDialog({ isOpen, onClose, onSave, items, config }) {
  const [markdown, setMarkdown] = useState("")
  const [errors, setErrors] = useState([])
  const [preview, setPreview] = useState([])

  useEffect(() => {
    if (isOpen) {
      if (items && items.length > 0) {
        setMarkdown(itemsToMarkdown(items))
      } else {
        // Empty template for adding new items
        setMarkdown(getEmptyTemplate())
      }
      setErrors([])
    }
  }, [isOpen, items])

  const getEmptyTemplate = () => {
    return `# New Item Title
- Status: planning
- Current: 0
- Total: 0
- Rating: 0
- Genres: 
- Tags: 
- Link: 
- Notes: 

---

# Another Item (optional)
- Status: planning
- Current: 0`
  }

  const itemsToMarkdown = (items) => {
    return items.map(item => {
      const lines = [
        `# ${item.title}`,
        `- Status: ${item.status || 'planning'}`,
        item.rating ? `- Rating: ${item.rating}` : null,
        `- Current: ${item.current || 0}`,
        `- Total: ${item.total || 0}`,
        item.genres?.length > 0 ? `- Genres: ${item.genres.join(', ')}` : null,
        item.tags?.length > 0 ? `- Tags: ${item.tags.join(', ')}` : null,
        item.favorite ? `- Favorite: true` : null,
        item.link ? `- Link: ${item.link}` : null,
        item.coverImage ? `- Cover: ${item.coverImage}` : null,
        item.notes ? `- Notes: ${item.notes}` : null,
      ].filter(Boolean)
      
      return lines.join('\n')
    }).join('\n\n---\n\n')
  }

  const markdownToItems = (md) => {
    // Split by --- with flexible whitespace handling
    const sections = md.split(/\n\s*-{3,}\s*\n/).filter(s => s.trim())
    const parsed = []
    const parseErrors = []

    sections.forEach((section, index) => {
      try {
        const lines = section.split('\n').map(l => l.trim()).filter(Boolean)
        // Find title line (allow leading whitespace which is already trimmed)
        const titleLine = lines.find(l => l.startsWith('#'))
        
        if (!titleLine) {
          parseErrors.push(`Section ${index + 1}: Missing title (should start with #)`)
          return
        }

        const item = {
          title: titleLine.replace(/^#+\s*/, '').trim(),
          status: 'planning',
          current: 0,
          total: 0,
          genres: [],
          tags: [],
          favorite: false
        }

        lines.forEach(line => {
          if (line.startsWith('- Status:')) {
            item.status = line.replace('- Status:', '').trim()
          } else if (line.startsWith('- Rating:')) {
            const rating = parseFloat(line.replace('- Rating:', '').trim())
            if (!isNaN(rating) && rating >= 0 && rating <= 10) {
              item.rating = rating
            }
          } else if (line.startsWith('- Current:')) {
            item.current = parseInt(line.replace('- Current:', '').trim()) || 0
          } else if (line.startsWith('- Total:')) {
            item.total = parseInt(line.replace('- Total:', '').trim()) || 0
          } else if (line.startsWith('- Genres:')) {
            const genresStr = line.replace('- Genres:', '').trim()
            item.genres = genresStr.split(',').map(g => g.trim()).filter(Boolean)
          } else if (line.startsWith('- Tags:')) {
            const tagsStr = line.replace('- Tags:', '').trim()
            item.tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean)
          } else if (line.startsWith('- Favorite:')) {
            item.favorite = line.replace('- Favorite:', '').trim().toLowerCase() === 'true'
          } else if (line.startsWith('- Link:')) {
            item.link = line.replace('- Link:', '').trim()
          } else if (line.startsWith('- Cover:')) {
            item.coverImage = line.replace('- Cover:', '').trim()
          } else if (line.startsWith('- Notes:')) {
            item.notes = line.replace('- Notes:', '').trim()
          }
        })

        // Find original item to preserve _id and type
        const originalItem = items[index]
        if (originalItem) {
          item._id = originalItem._id
          item.type = originalItem.type
        } else {
          // New item - get type from config or use first available type
          item.type = config?.customTypes?.[0]?.name || 'Media'
        }

        parsed.push(item)
      } catch (error) {
        parseErrors.push(`Section ${index + 1}: ${error.message}`)
      }
    })

    return { parsed, errors: parseErrors }
  }

  const handlePreview = () => {
    const { parsed, errors: parseErrors } = markdownToItems(markdown)
    setErrors(parseErrors)
    setPreview(parsed)
  }

  const handleSave = () => {
    const { parsed, errors: parseErrors } = markdownToItems(markdown)
    
    if (parseErrors.length > 0) {
      setErrors(parseErrors)
      toast.error(`Please fix ${parseErrors.length} error(s) before saving`)
      return
    }

    onSave(parsed)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Smart {items?.length > 0 ? 'Edit' : 'Add'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {items?.length > 0 ? 'Edit multiple items using markdown format' : 'Add new items using markdown format'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Markdown Editor</h3>
                <Button size="sm" variant="ghost" onClick={handlePreview}>
                  <FileText className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 p-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm resize-none outline-none"
              placeholder="# Title&#10;- Status: planning&#10;- Current: 0&#10;- Total: 12&#10;- Genres: Action, Fantasy&#10;&#10;---&#10;&#10;# Another Title&#10;..."
            />
          </div>

          {/* Preview/Errors */}
          <div className="w-96 flex flex-col bg-slate-50 dark:bg-slate-900/50">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className={`text-sm font-bold ${errors.length > 0 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                {errors.length > 0 ? `Errors (${errors.length})` : `Preview (${preview.length})`}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {errors.length > 0 ? (
                errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                ))
              ) : preview.length > 0 ? (
                preview.map((item, index) => (
                  <div key={index} className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                      {item.favorite && <CheckCircle className="w-4 h-4 text-amber-500" />}
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <p>Status: <span className="font-medium">{item.status}</span></p>
                      <p>Progress: <span className="font-medium">{item.current}/{item.total || '?'}</span></p>
                      {item.rating && <p>Rating: <span className="font-medium">★ {item.rating}</span></p>}
                      {item.genres?.length > 0 && (
                        <p>Genres: <span className="font-medium">{item.genres.join(', ')}</span></p>
                      )}
                      {item.tags?.length > 0 && (
                        <p>Tags: <span className="font-medium">{item.tags.join(', ')}</span></p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <FileText className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">Click Preview to see changes</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p>Editing {items?.length || 0} items • Use <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">---</code> to separate items</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={errors.length > 0}>
              <Save className="w-4 h-4 mr-2" />
              Save All Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
