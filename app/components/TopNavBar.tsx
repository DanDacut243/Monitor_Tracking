'use client'

import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'admin' | 'accountant' | 'viewer'

interface TopNavBarProps {
  role: Role
}

interface NotificationLog {
  id: string
  action: string
  created_at: string
  metadata: any
  document_id: string | null
}

export function TopNavBar({ role }: TopNavBarProps) {
  const supabase = createSupabaseBrowser()
  const router = useRouter()
  const [recentLogs, setRecentLogs] = useState<NotificationLog[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadLogs() {
      const since = new Date()
      since.setDate(since.getDate() - 1)
      const { data } = await supabase
        .from('audit_logs')
        .select('id, action, created_at, metadata, document_id')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: false })
        .limit(10)
      if (data) setRecentLogs(data)
    }
    loadLogs()

    // Live notification updates
    const channel = supabase
      .channel('topnav_notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, (payload) => {
        setRecentLogs((prev) => [payload.new as NotificationLog, ...prev].slice(0, 10))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabase])

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSearch(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/documents?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const unreadCount = recentLogs.length

  const actionColors: Record<string, string> = {
    upload: 'text-blue-500',
    edit: 'text-slate-500',
    delete: 'text-red-500',
    view: 'text-emerald-500',
  }

  const actionIcons: Record<string, string> = {
    upload: 'upload',
    edit: 'edit',
    delete: 'delete',
    view: 'visibility',
  }

  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm dark:shadow-none flex items-center justify-between px-8">
      {/* Search */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
            search
          </span>
          <input
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 ring-blue-500/20 placeholder-slate-400 transition-all text-slate-900 dark:text-slate-100 outline-none"
            placeholder="Search documents… (Enter)"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications((v) => !v)}
            className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-white dark:border-slate-900 text-white text-[9px] font-bold flex items-center justify-center px-1">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Activity</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Last 24h</span>
              </div>
              <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-slate-100 dark:divide-slate-800">
                {recentLogs.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">No recent activity</p>
                ) : (
                  recentLogs.map((log) => (
                    <div key={log.id} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <span
                          className={`material-symbols-outlined text-sm mt-0.5 ${actionColors[log.action] || 'text-slate-400'}`}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {actionIcons[log.action] || 'info'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 capitalize">{log.action}</p>
                          <p className="text-[11px] text-slate-500 truncate">{log.metadata?.details || log.metadata?.title || 'System event'}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {role === 'admin' && (
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href="/audit-logs"
                    className="text-xs font-bold text-primary dark:text-blue-400 hover:underline"
                    onClick={() => setShowNotifications(false)}
                  >
                    View full audit trail →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help */}
        <button
          id="help-btn"
          className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <span className="material-symbols-outlined">help_outline</span>
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

        {/* Role badge */}
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${
          role === 'admin' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
          role === 'accountant' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' :
          'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {role}
        </span>
      </div>
    </header>
  )
}
