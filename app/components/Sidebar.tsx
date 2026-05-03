'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useState } from 'react'

type Role = 'admin' | 'accountant' | 'viewer'

const allNavItems = [
  { href: '/', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'accountant', 'viewer'] as Role[] },
  { href: '/documents', label: 'Inventory', icon: 'inventory', roles: ['admin', 'accountant', 'viewer'] as Role[] },
  { href: '/upload', label: 'Upload', icon: 'cloud_upload', roles: ['admin', 'accountant'] as Role[] },
  { href: '/clients', label: 'Clients', icon: 'group', roles: ['admin', 'accountant'] as Role[] },
  { href: '/audit-logs', label: 'Audit Logs', icon: 'history', roles: ['admin'] as Role[] },
  { href: '/settings', label: 'Settings', icon: 'settings', roles: ['admin', 'accountant'] as Role[] },
]

const roleLabels: Record<Role, string> = {
  admin: 'Administrator',
  accountant: 'Accountant',
  viewer: 'Viewer',
}

const roleColors: Record<Role, string> = {
  admin: 'text-red-500 dark:text-red-400',
  accountant: 'text-emerald-600 dark:text-emerald-400',
  viewer: 'text-slate-400',
}

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createSupabaseBrowser()
  const [signingOut, setSigningOut] = useState(false)

  async function handleLogout() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = allNavItems.filter((item) => item.roles.includes(role))

  return (
    <nav className="fixed left-0 top-0 h-full flex flex-col bg-slate-50 dark:bg-slate-900 w-64 border-r border-slate-200/50 dark:border-slate-800/50 z-50">
      <div className="p-8">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance_wallet
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-blue-900 dark:text-blue-100 font-headline">
              The Ledger
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Financial Vault</p>
          </div>
        </div>

        {/* New Document CTA — hidden for viewers */}
        {(role === 'admin' || role === 'accountant') && (
          <Link
            href="/upload"
            className="w-full premium-gradient text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mb-8 shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.95]"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Document
          </Link>
        )}

        {/* Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-500 dark:text-slate-400 font-medium hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* User Info + Sign Out */}
      <div className="mt-auto p-6 border-t border-slate-200/50 dark:border-slate-800/50">
        {/* Role badge */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-slate-400" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          <span className={`text-xs font-bold uppercase tracking-widest ${roleColors[role]}`}>
            {roleLabels[role]}
          </span>
        </div>

        <button
          onClick={handleLogout}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-sm">
            {signingOut ? 'progress_activity' : 'logout'}
          </span>
          {signingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </nav>
  )
}
