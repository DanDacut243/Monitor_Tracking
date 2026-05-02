import { getStats, getRecentDocuments, getRecentActivity } from '@/lib/api'
import DashboardClient from './DashboardClient'
import { createSupabaseServer } from '@/lib/supabase-server'

export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let role = 'viewer'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role) role = profile.role
  }

  const [stats, documents, activity] = await Promise.all([
    getStats(),
    getRecentDocuments(5),
    getRecentActivity(5),
  ])

  const roleHeadings: Record<string, { title: string; subtitle: string }> = {
    admin: { title: 'Executive Overview', subtitle: 'Real-time financial document auditing and vault status.' },
    accountant: { title: 'Accountant Dashboard', subtitle: 'Manage client documents and review recent uploads.' },
    viewer: { title: 'Viewer Dashboard', subtitle: 'Read-only view of current inventory and documents.' },
  }

  const { title, subtitle } = roleHeadings[role] || roleHeadings.viewer

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-semibold font-headline text-primary dark:text-blue-400 tracking-tight">
            {title}
          </h2>
          <p className="text-sm font-body text-secondary mt-1">{subtitle}</p>
        </div>
        <div className="flex gap-3">
          <button
            id="download-report-btn"
            className="bg-surface-container-highest dark:bg-slate-800 text-on-surface dark:text-slate-200 text-sm font-semibold px-4 py-2 rounded-lg transition-colors hover:bg-surface-container-high dark:hover:bg-slate-700"
          >
            Download Report
          </button>
          {(role === 'admin' || role === 'accountant') && (
            <button
              id="export-all-btn"
              className="premium-gradient text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity"
            >
              Export All
            </button>
          )}
        </div>
      </div>

      <DashboardClient
        initialStats={stats}
        initialDocuments={documents || []}
        initialActivity={activity || []}
        role={role as 'admin' | 'accountant' | 'viewer'}
      />
    </div>
  )
}
