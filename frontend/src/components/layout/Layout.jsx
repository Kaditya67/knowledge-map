import Sidebar from "./Sidebar"
import Header from "./Header"

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
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
