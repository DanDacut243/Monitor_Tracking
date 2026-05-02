'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
        </div>
        <h1 className="text-3xl font-extrabold font-headline text-primary dark:text-blue-400 tracking-tight">The Ledger</h1>
        <p className="text-slate-500 mt-2 text-sm">Sign in to your financial vault</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}
          
          <div>
            <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none"
                placeholder="auditor@company.com"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">lock</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-gradient text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                Authenticating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                Sign In to Vault
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Don&apos;t have access?{' '}
            <Link href="/register" className="text-primary dark:text-blue-400 font-bold hover:underline">
              Request Account
            </Link>
          </p>
        </div>
      </div>
      
      <p className="text-[10px] text-center text-slate-400 mt-8 uppercase font-bold tracking-widest">
        Secured with AES-256 encryption
      </p>
    </div>
  )
}
