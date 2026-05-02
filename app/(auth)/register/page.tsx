'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          // All new self-registered users default to viewer — admins promote via Settings
          role: 'viewer',
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span
            className="material-symbols-outlined text-3xl text-emerald-600 dark:text-emerald-400"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h2 className="text-2xl font-extrabold font-headline text-slate-900 dark:text-slate-100">
          Account Created
        </h2>
        <p className="text-slate-500 mt-3 text-sm">
          Please check your email to verify your account before signing in. You will be assigned
          <strong> Viewer</strong> access by default. Contact your admin to upgrade permissions.
        </p>
        <Link
          href="/login"
          className="inline-block mt-8 premium-gradient text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
        >
          Go to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <div className="w-16 h-16 premium-gradient rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-primary/20">
          <span
            className="material-symbols-outlined text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            account_balance_wallet
          </span>
        </div>
        <h1 className="text-3xl font-extrabold font-headline text-primary dark:text-blue-400 tracking-tight">
          Create Account
        </h1>
        <p className="text-slate-500 mt-2 text-sm">Register for read-only access to the financial vault</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {/* Access level info banner — no option to self-assign admin */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              info
            </span>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              New accounts receive <strong>Viewer</strong> access by default. An Administrator can upgrade your permissions after sign-up.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">
              Full Name
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                person
              </span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none"
                placeholder="Julian Thorne"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                mail
              </span>
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
            <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">
              Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                lock
              </span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none"
                placeholder="Minimum 6 characters"
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
                Creating Account...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">person_add</span>
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Already have access?{' '}
            <Link href="/login" className="text-primary dark:text-blue-400 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
