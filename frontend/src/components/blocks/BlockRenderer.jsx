import ReactMarkdown from "react-markdown"
import { ExternalLink, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react"

function BlockRenderer({ block }) {
  const renderBlock = () => {
    switch (block.type) {
      case "markdown":
        return (
          <div className="prose dark:prose-invert max-w-none prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-normal prose-pre:bg-slate-900 dark:prose-pre:bg-slate-950 prose-pre:rounded-xl prose-a:text-indigo-600 dark:prose-a:text-indigo-400">
            <ReactMarkdown>{block.content.text}</ReactMarkdown>
          </div>
        )

      case "image":
        return (
          <figure className="rounded-xl overflow-hidden">
            <img
              src={block.content.url || "/placeholder.svg?height=400&width=600&query=placeholder image"}
              alt={block.content.caption || "Image"}
              className="w-full h-auto"
            />
            {block.content.caption && (
              <figcaption className="mt-3 text-sm text-center text-slate-500 dark:text-slate-400">
                {block.content.caption}
              </figcaption>
            )}
          </figure>
        )

      case "gallery":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {block.content.images.map((image, index) => (
              <figure key={index} className="rounded-xl overflow-hidden">
                <img
                  src={image.url || "/placeholder.svg?height=200&width=300&query=gallery image"}
                  alt={image.caption || `Image ${index + 1}`}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
                {image.caption && (
                  <figcaption className="mt-2 text-xs text-center text-slate-500 dark:text-slate-400">
                    {image.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )

      case "link":
        return (
          <a
            href={block.content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {block.content.label}
              </p>
              {block.content.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{block.content.description}</p>
              )}
              <p className="text-xs text-slate-400 mt-2 truncate">{block.content.url}</p>
            </div>
          </a>
        )

      case "diagram":
        return (
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
              <p className="font-semibold text-slate-900 dark:text-white">{block.content.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{block.content.tool}</p>
            </div>
            <a
              href={block.content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-10 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-2 font-medium">
                <ExternalLink className="w-4 h-4" />
                Open Diagram
              </span>
            </a>
          </div>
        )

      case "note":
        const noteStyles = {
          info: {
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-200 dark:border-blue-800",
            icon: Info,
            iconColor: "text-blue-500",
          },
          warning: {
            bg: "bg-amber-50 dark:bg-amber-900/20",
            border: "border-amber-200 dark:border-amber-800",
            icon: AlertTriangle,
            iconColor: "text-amber-500",
          },
          success: {
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            border: "border-emerald-200 dark:border-emerald-800",
            icon: CheckCircle,
            iconColor: "text-emerald-500",
          },
          error: {
            bg: "bg-red-50 dark:bg-red-900/20",
            border: "border-red-200 dark:border-red-800",
            icon: AlertCircle,
            iconColor: "text-red-500",
          },
        }

        const style = noteStyles[block.content.noteType] || noteStyles.info
        const IconComponent = style.icon

        return (
          <div className={`flex items-start gap-4 p-5 rounded-xl border ${style.bg} ${style.border}`}>
            <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${style.iconColor}`} />
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{block.content.text}</p>
          </div>
        )

      default:
        return <p className="text-slate-500 dark:text-slate-400">Unknown block type: {block.type}</p>
    }
  }

  return <div className="mb-6 animate-fade-in">{renderBlock()}</div>
}

export default BlockRenderer
