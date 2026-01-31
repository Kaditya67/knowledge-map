import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

let toastId = 0
const toastListeners = new Set()

export const toast = {
  success: (message) => notify({ type: 'success', message }),
  error: (message) => notify({ type: 'error', message }),
  info: (message) => notify({ type: 'info', message }),
  warning: (message) => notify({ type: 'warning', message }),
}

function notify(toast) {
  const id = toastId++
  const toastWithId = { ...toast, id }
  toastListeners.forEach(listener => listener(toastWithId))
  
  // Auto dismiss after 5 seconds
  setTimeout(() => {
    toastListeners.forEach(listener => listener({ id, dismiss: true }))
  }, 5000)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const listener = (toast) => {
      if (toast.dismiss) {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      } else {
        setToasts(prev => [...prev, toast])
      }
    }
    
    toastListeners.add(listener)
    return () => toastListeners.delete(listener)
  }, [])

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({ type, message, onClose }) {
  const styles = {
    success: {
      bg: 'bg-emerald-500',
      icon: CheckCircle,
      iconColor: 'text-white'
    },
    error: {
      bg: 'bg-red-500',
      icon: AlertCircle,
      iconColor: 'text-white'
    },
    warning: {
      bg: 'bg-amber-500',
      icon: AlertTriangle,
      iconColor: 'text-white'
    },
    info: {
      bg: 'bg-blue-500',
      icon: Info,
      iconColor: 'text-white'
    }
  }

  const style = styles[type] || styles.info
  const Icon = style.icon

  return (
    <div className={`${style.bg} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up`}>
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
        <Icon className={`w-5 h-5 ${style.iconColor}`} />
      </div>
      <p className="flex-1 font-medium text-sm">{message}</p>
      <button 
        onClick={onClose}
        className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
