import { TrendingUp, Star, CheckCircle, Heart, BarChart3 } from "lucide-react"

export default function MediaStats({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl h-24" />
        ))}
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      label: "Total Items",
      value: stats.totalItems || 0,
      icon: BarChart3,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50 dark:bg-indigo-500/10"
    },
    {
      label: "Completed",
      value: `${stats.completionRate || 0}%`,
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10"
    },
    {
      label: "Avg Rating",
      value: stats.avgRating || "N/A",
      icon: Star,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-500/10"
    },
    {
      label: "Favorites",
      value: stats.favoriteItems || 0,
      icon: Heart,
      color: "text-pink-500",
      bgColor: "bg-pink-50 dark:bg-pink-500/10"
    }
  ]

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Genre Breakdown */}
      {stats.genreBreakdown && stats.genreBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            Top Genres
          </h3>
          <div className="space-y-3">
            {stats.genreBreakdown.slice(0, 5).map((genre, index) => {
              const maxCount = stats.genreBreakdown[0].count
              const percentage = (genre.count / maxCount) * 100
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {genre._id || "Unspecified"}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {genre.count} {genre.count === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      {stats.statusBreakdown && stats.statusBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Status Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stats.statusBreakdown.map((status, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3 text-center"
              >
                <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {status.count}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {status._id.replace(/_/g, " ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
