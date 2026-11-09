import { useState } from "react"
import { LogIn, UserPlus, Loader2, Sparkles, Eye, EyeOff, BookOpen, X } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import Input from "../ui/Input"
import Button from "../ui/Button"

export default function AuthModal({ isOpen, onClose, initialTab = "login", onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState(initialTab) // 'login' | 'register'
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login, register } = useAuth()

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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      await register(username, email, password)
      onClose()
      if (onAuthSuccess) onAuthSuccess()
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
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
        <div className="p-6 pb-4 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 items-center justify-center text-white shadow-lg shadow-indigo-500/25 mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {activeTab === "login" ? "Sign in to Knowledge Hub" : "Create Your Account"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeTab === "login"
              ? "Sign in to edit pages, customize collections, and manage media"
              : "Start organizing your notes and entertainment library"}
          </p>

          {/* Tab Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mt-4">
            <button
              onClick={() => { setActiveTab("login"); setError(""); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "login"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab("register"); setError(""); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "register"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 pt-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          {activeTab === "login" ? (
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
                className="w-full justify-center py-2.5 text-sm font-semibold shadow-md shadow-indigo-500/20"
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
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <Input
                label="Username"
                type="text"
                placeholder="Your name or handle"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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

              <Input
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full justify-center py-2.5 text-sm font-semibold shadow-md shadow-indigo-500/20 mt-1"
                disabled={loading}
                variant="primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Register
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
