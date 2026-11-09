import { useState } from "react"
import { LogIn, Loader2, Sparkles, Eye, EyeOff, BookOpen, X, ShieldAlert } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import Input from "../ui/Input"
import Button from "../ui/Button"

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()

  if (!isOpen) return null

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      onClose()
      if (onAuthSuccess) onAuthSuccess()
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Top Banner */}
        <div className="p-6 pb-2 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Admin Authentication
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in with your owner credentials to edit and manage content
          </p>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 pt-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
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
              className="w-full justify-center py-2.5 text-sm font-semibold shadow-md shadow-indigo-500/20 mt-2"
              disabled={loading}
              variant="primary"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </>
              )}
            </Button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fill Demo Credentials
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
