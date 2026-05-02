'use client'

import { format } from 'date-fns'
import { useRealtimeStats, useRealtimeDocuments, useRealtimeAuditLogs } from '@/lib/hooks'
import Link from 'next/link'

type Role = 'admin' | 'accountant' | 'viewer'

export default function DashboardClient({
  initialStats,
  initialDocuments,
  initialActivity,
  role = 'viewer',
}: {
  initialStats: any
  initialDocuments: any[]
  initialActivity: any[]
  role?: Role
}) {
  useRealtimeStats()
  useRealtimeDocuments()
  useRealtimeAuditLogs()

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Hero Card */}
        <div className="col-span-12 lg:col-span-4 bg-primary text-white p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-primary/10">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#b6c4ff]/80">
              Active Inventory
            </span>
            <h3 className="text-5xl font-bold font-headline mt-4">
              {(initialStats.totalDocuments || 0).toLocaleString()}
            </h3>
            <p className="text-sm text-[#b6c4ff]/70 mt-2 font-medium">Documents Tracked</p>
          </div>
          <div className="mt-8 flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#b6c4ff]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="text-xs font-semibold">Realtime Sync Active</span>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Clients */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-700 dark:text-blue-400">group</span>
              </div>
              <span className="text-[10px] font-bold text-primary px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                ACTIVE
              </span>
            </div>
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Total Clients</p>
              <h4 className="text-2xl font-bold font-headline text-slate-900 dark:text-slate-100">
                {initialStats.totalClients || 0}
              </h4>
            </div>
          </div>

          {/* Recent Uploads */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400">
                  cloud_done
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                RECENT
              </span>
            </div>
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Uploads (7 days)</p>
              <h4 className="text-2xl font-bold font-headline text-slate-900 dark:text-slate-100">
                {initialStats.recentUploads || 0}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Recent Documents Table */}
        <div className={`col-span-12 ${role === 'admin' ? 'lg:col-span-8' : ''} space-y-6`}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-sm font-headline text-slate-900 dark:text-slate-100">
                Recent Transactions
              </h3>
              <Link
                href="/documents"
                className="text-xs font-bold text-slate-400 hover:text-primary dark:hover:text-blue-400 uppercase tracking-widest transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Document</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Entity</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {initialDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center">
                        <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 block mb-2">
                          folder_open
                        </span>
                        <p className="text-slate-500 text-sm">No recent documents</p>
                      </td>
                    </tr>
                  ) : (
                    initialDocuments.map((doc: any) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-lg">
                              attachment
                            </span>
                            <span className="text-sm font-medium text-primary dark:text-blue-400 truncate max-w-[150px]">
                              {doc.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                          {doc.clients?.name || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {format(new Date(doc.created_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-right tabular-nums text-slate-900 dark:text-slate-100">
                          {doc.amount ? `$${Number(doc.amount).toLocaleString()}` : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Actions — Admin only */}
        {role === 'admin' && (
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
              <h3 className="text-lg font-semibold font-headline mb-6 text-slate-900 dark:text-slate-100">
                Recent Actions
              </h3>

              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                {initialActivity.length === 0 ? (
                  <div className="text-center text-sm text-slate-500 py-4">No recent activity</div>
                ) : (
                  initialActivity.map((log: any) => (
                    <div key={log.id} className="relative pl-8">
                      <div
                        className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center ${
                          log.action === 'upload'
                            ? 'bg-primary'
                            : log.action === 'edit'
                            ? 'bg-slate-400'
                            : log.action === 'delete'
                            ? 'bg-red-500'
                            : 'bg-emerald-500'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[10px] text-white">
                          {log.action === 'upload'
                            ? 'upload'
                            : log.action === 'edit'
                            ? 'edit'
                            : log.action === 'delete'
                            ? 'delete'
                            : 'check'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 capitalize">
                        {log.action}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 truncate max-w-full">
                        {log.metadata?.details || log.metadata?.title || log.documents?.title || 'System event'}
                      </p>
                      <p className="text-[10px] text-primary dark:text-blue-400 font-bold mt-1 uppercase">
                        {format(new Date(log.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <Link
                href="/audit-logs"
                className="w-full mt-8 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors block text-center"
              >
                VIEW FULL LOG
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
