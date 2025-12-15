import { NavLink } from "react-router-dom"
import { Home, Tag, Star, Plus, BookOpen, Folder } from "lucide-react"
import { useApp } from "../../context/AppContext"

function Sidebar() {
  const { pages, tags } = useApp()
  const favoritePages = pages.filter((page) => page.isFavorite)

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/tags", icon: Tag, label: "Tags" },
  ]

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Knowledge Hub</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Personal Wiki</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Favorites Section */}
        {favoritePages.length > 0 && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star className="w-3.5 h-3.5" />
              Favorites
            </h3>
            <div className="space-y-1">
              {favoritePages.slice(0, 5).map((page) => (
                <NavLink
                  key={page._id}
                  to={`/page/${page._id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`
                  }
                >
                  <span className="text-base">{page.icon}</span>
                  <span className="truncate">{page.title}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Tags Section */}
        {tags.length > 0 && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Folder className="w-3.5 h-3.5" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2 px-3">
              {tags.slice(0, 8).map((tag) => (
                <span
                  key={tag._id}
                  className="px-2.5 py-1 text-xs font-medium rounded-lg transition-transform hover:scale-105"
                  style={{ backgroundColor: `${tag.color}15`, color: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Create Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <NavLink
          to="/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          New Page
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar
