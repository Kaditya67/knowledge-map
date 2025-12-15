function Badge({ children, color = "#6366f1", variant = "default", className = "" }) {
  const variants = {
    default: "",
    outline: "border",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wide ${variants[variant]} ${className}`}
      style={{
        backgroundColor: variant === "outline" ? "transparent" : `${color}15`,
        color: color,
        borderColor: variant === "outline" ? color : "transparent",
      }}
    >
      {children}
    </span>
  )
}

export default Badge
