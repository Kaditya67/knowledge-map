"use client"

import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"

function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // mobile only
  const [isCollapsed, setIsCollapsed] = useState(true)     // desktop only - collapsed by default

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)

      if (mobile) {
        setIsSidebarOpen(false)   // closed by default on mobile
      }
      // Desktop sidebar stays collapsed (as set in initial state)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 overflow-hidden font-sans antialiased selection:bg-indigo-500/30">
      
      {/* Mobile overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar wrapper */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-50
          transition-all duration-300 ease-in-out
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
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

        <Header
          onMenuClick={() =>
            isMobile
              ? setIsSidebarOpen(p => !p)
              : setIsCollapsed(p => !p)
          }
          isSidebarOpen={isMobile ? isSidebarOpen : !isCollapsed}
        />

        <main className="flex-1 overflow-y-auto relative z-10">
          <div className="min-h-full p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
