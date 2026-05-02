'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const icons: Record<ToastType, string> = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  }

  const colors: Record<ToastType, string> = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    warning: 'bg-amber-500',
    info: 'bg-blue-600',
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-semibold min-w-[280px] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-2 duration-300 ${colors[t.type]}`}
          >
            <span
              className="material-symbols-outlined text-lg shrink-0"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {icons[t.type]}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => remove(t.id)}
              className="text-white/70 hover:text-white transition-colors shrink-0"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx.toast
}
