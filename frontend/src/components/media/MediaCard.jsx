import { Star, Edit, Trash2, ExternalLink, Play, CheckCircle } from "lucide-react"
import Badge from "../ui/Badge"
import { useAuth } from "../../context/AuthContext"

export default function MediaCard({ item, config, onEdit, onDelete, onIncrement, onToggleFavorite, viewMode = "grid" }) {
  const { user } = useAuth()
  const progressPercent = item.total > 0 ? Math.min((item.current / item.total) * 100, 100) : 0
  const typeConfig = config?.customTypes?.find(t => t.name === item.type) || { unit: "Ep" }
  const statusObj = config?.customStatuses?.find(s => s.value === item.status)

  if (viewMode === "list") {
    return (
      <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg transition-all duration-300 flex items-center gap-4">
        {/* Cover Image */}
        {item.coverImage && (
          <div className="w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
            <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <h3 className="font-bold text-slate-900 dark:text-white truncate flex-1">{item.title}</h3>
            {item.favorite && <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
          </div>
          
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge color={statusObj?.color || "#94a3b8"}>{statusObj?.label || item.status}</Badge>
            {item.rating && <span className="text-xs font-bold text-amber-500">★ {item.rating}</span>}
            {item.genres?.slice(0, 2).map(genre => (
              <span key={genre} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                {genre}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.total > 0 ? progressPercent : 0}%` }} />
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
              {item.current} / {item.total || "?"} {typeConfig.unit}
            </span>
          </div>
        </div>
        
        {/* Actions - Only show when authenticated */}
        {user && (
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button onClick={() => onToggleFavorite(item)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
              <Star className={`w-4 h-4 ${item.favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button onClick={() => onEdit(item)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(item._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
            {item.status !== "completed" && (
              <button 
                onClick={() => onIncrement(item)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                +1 {typeConfig.unit}
              </button>
            )}
          </div>
        )}
        
        {/* Link for non-authenticated users */}
        {!user && item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    )
  }

  // Grid view (default)
  const cardContent = (
    <>
      {/* Cover Image */}
      {item.coverImage && (
        <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
          {user && item.favorite && (
            <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
          )}
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 flex-1 pr-2" title={item.title}>
            {item.title}
          </h3>
          
          {user && (
            <div className="flex gap-1 shrink-0">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(item); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                <Star className={`w-3.5 h-3.5 ${item.favorite ? 'fill-amber-500 text-amber-500' : ''}`} />
              </button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(item); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(item._id); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge color={statusObj?.color || "#94a3b8"}>{statusObj?.label || item.status}</Badge>
          {item.rating && <span className="text-xs font-bold text-amber-500">★ {item.rating}</span>}
        </div>
        
        {/* Genres */}
        {item.genres && item.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.genres.slice(0, 3).map(genre => (
              <span key={genre} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                {genre}
              </span>
            ))}
            {item.genres.length > 3 && (
              <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full">
                +{item.genres.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">
            <span>Progress</span>
            <span>{item.current} / {item.total || "?"} {typeConfig.unit}</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${item.total > 0 ? progressPercent : 0}%` }} />
          </div>
        </div>

        {/* Action - Only show increment button when authenticated */}
        {user && (
          <div className="flex justify-end">
            {item.status !== "completed" ? (
              <button 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onIncrement(item); }}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                +1 {typeConfig.unit}
              </button>
            ) : (
              <div className="w-full text-center py-2.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl flex items-center justify-center gap-2">
                <CheckCircle className="w-3.5 h-3.5" />
                Completed
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );

  // Render as link if item has a link, otherwise as div
  if (item.link) {
    return (
      <a 
        href={item.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {cardContent}
    </div>
  );
}
