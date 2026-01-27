import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LogIn, Loader2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
      setError(err.response?.data?.message || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Sign in
          </h2>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full justify-center text-lg py-3"
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
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
          © {new Date().getFullYear()} Knowledge Hub. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default LoginPage
