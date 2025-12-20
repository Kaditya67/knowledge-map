"use client"

import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"

function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // mobile only
  const [isCollapsed, setIsCollapsed] = useState(false)     // desktop only

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      if (mobile) {
        setIsSidebarOpen(false)   // closed by default on mobile
      } else {
        setIsCollapsed(false)     // expanded by default on desktop
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar wrapper */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          transition-all duration-300
          ${isMobile
            ? isSidebarOpen
              ? "translate-x-0 w-72"
              : "-translate-x-full w-72"
            : isCollapsed
              ? "w-20"
              : "w-72"}
        `}
      >
        <Sidebar
          isCollapsed={!isMobile && isCollapsed}
          onClose={() => setIsSidebarOpen(false)}     // mobile
          onToggle={() => setIsCollapsed(p => !p)}   // desktop
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          onMenuClick={() =>
            isMobile
              ? setIsSidebarOpen(p => !p)
              : setIsCollapsed(p => !p)
          }
          isSidebarOpen={isMobile ? isSidebarOpen : !isCollapsed}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
