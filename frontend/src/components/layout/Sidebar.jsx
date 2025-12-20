import { NavLink } from "react-router-dom"
import {
  Home,
  Tag,
  Star,
  Plus,
  BookOpen,
  Folder,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { useApp } from "../../context/AppContext"

function Sidebar({ isCollapsed, onToggle, onClose }) {
  const { pages, tags } = useApp()
  const favoritePages = pages.filter((page) => page.isFavorite)

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/tags", icon: Tag, label: "Tags" },
  ]

  return (
    <aside
      className={`h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Logo */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-5 h-5 text-white" />
            </div>

            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  Knowledge Hub
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Personal Wiki
                </p>
              </div>
            )}
          </div>

          {/* Mobile close */}
          {!isCollapsed && (
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed ? "justify-center" : "gap-3"
                } px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {!isCollapsed && item.label}
            </NavLink>
          ))}
        </div>

        {/* Favorites */}
        {!isCollapsed && favoritePages.length > 0 && (
          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <Star className="w-3.5 h-3.5" />
              Favorites
            </h3>

            {favoritePages.slice(0, 5).map((page) => (
              <NavLink
                key={page._id}
                to={`/page/${page._id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span>{page.icon}</span>
                <span className="truncate">{page.title}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* Create */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <NavLink
          to="/new"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium"
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && "New Page"}
        </NavLink>
      </div>

      {/* Desktop Toggle */}
      <button
        onClick={onToggle}
        className="hidden md:flex items-center justify-center p-3 border-t border-slate-200 dark:border-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  )
}

export default Sidebar
