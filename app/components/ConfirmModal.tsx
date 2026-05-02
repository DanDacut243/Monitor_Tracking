'use client'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] animate-in fade-in p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${destructive ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
            <span className={`material-symbols-outlined ${destructive ? 'text-red-500' : 'text-blue-500'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {destructive ? 'delete_forever' : 'help'}
            </span>
          </div>
          <h3 className="text-lg font-bold font-headline text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-bold rounded-lg text-white transition-opacity hover:opacity-90 ${destructive ? 'bg-red-600' : 'premium-gradient'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
