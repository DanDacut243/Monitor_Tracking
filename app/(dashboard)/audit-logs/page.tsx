import { getRecentAuditLogs } from '@/lib/api'
import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AuditLogsClient from './AuditLogsClient'

export const revalidate = 0

export default async function AuditLogsPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role || 'viewer'

  // Only admins can view audit logs
  if (role !== 'admin') redirect('/')

  const logs = await getRecentAuditLogs(100)

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline tracking-tight text-primary dark:text-blue-400">
            System Audit Trail
          </h2>
          <p className="text-on-secondary-container dark:text-slate-400 mt-2 font-body">
            Immutable, cryptographic-style logging for all platform activities.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            id="export-audit-csv-btn"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export CSV
          </button>
        </div>
      </header>

      <AuditLogsClient initialLogs={logs || []} />
    </div>
  )
}
