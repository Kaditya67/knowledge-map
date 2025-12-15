function Card({ children, className = "", hover = false, ...props }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm ${
        hover ? "hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
