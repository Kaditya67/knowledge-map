import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { LogIn, Loader2, Sparkles, Eye, EyeOff, BookOpen, CheckCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      navigate("/", { state: { welcome: true } })
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please verify your email and password.")
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAccount = () => {
    setEmail("admin@example.com")
    setPassword("admin123")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 dark:from-[#0a0a0c] dark:via-[#0e111a] dark:to-[#090b10] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: Brand Showcase */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-8 rounded-3xl bg-white/40 dark:bg-white/[0.03] backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-2xl min-h-[540px]">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Knowledge Hub
                </h1>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  Personal Wiki & Media Catalog
                </p>
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                Organize thoughts, notes, and entertainment sources in one place.
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Seamlessly organize your knowledge base, track Manhwa, Manga, and Anime chapters, and gain clarity on where your media comes from.
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-3 pt-6 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Multi-provider scan tracker (Asura, MangaPark, etc.)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Markdown editor with instant tags & page hierarchy</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Fluid light and dark themes with zero clutter</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="w-full lg:col-span-6 max-w-md mx-auto">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl p-8 sm:p-10 relative">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="lg:hidden inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Welcome back
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Enter your credentials to access your workspace
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm text-center animate-in fade-in duration-200">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button
                type="submit"
                className="w-full justify-center py-3 text-base font-semibold shadow-lg shadow-indigo-500/25"
                disabled={loading}
                variant="primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign in
                  </>
                )}
              </Button>
            </form>

            {/* Quick Fill Helper */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fill Demo Credentials (admin@example.com)
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} Knowledge Hub. Secure local wiki environment.
          </p>
        </div>

      </div>
    </div>
  )
}

export default LoginPage
