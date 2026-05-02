'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useRealtimeAuditLogs } from '@/lib/hooks'
import { useToast } from '@/app/components/ToastProvider'

export default function AuditLogsClient({ initialLogs }: { initialLogs: any[] }) {
  useRealtimeAuditLogs()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredLogs = initialLogs.filter((log: any) => {
    const matchesSearch =
      log.metadata?.details?.toLowerCase().includes(search.toLowerCase()) ||
      log.metadata?.title?.toLowerCase().includes(search.toLowerCase()) ||
      log.documents?.title?.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || log.action === filter
    return matchesSearch && matchesFilter
  })

  function handleExportCSV() {
    const headers = ['Timestamp', 'Event', 'Document', 'Details', 'Actor ID']
    const rows = filteredLogs.map((log: any) => [
      format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
      log.action,
      log.documents?.title || 'N/A',
      log.metadata?.details || log.metadata?.title || '',
      log.user_id || 'system',
    ])
    const csv = [headers, ...rows].map((r) => r.map((v: string) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('CSV exported successfully', 'success')
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 flex-col sm:flex-row gap-4">
        <div className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none font-mono"
            placeholder="Search action, asset, or details..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'upload', 'edit', 'delete'].map((f) => (
            <button
              key={f}
              id={`filter-${f}-btn`}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors border ${
                filter === f
                  ? 'bg-slate-800 text-white border-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">download</span>
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20 w-36">Timestamp</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20 w-28">Event Type</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20">Asset Reference</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20">Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20 text-right">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 font-mono text-sm">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center font-sans">
                  <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 block mb-3">manage_search</span>
                  <p className="text-slate-500">No audit records found matching criteria.</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                    {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                        log.action === 'upload'
                          ? 'bg-primary/10 text-primary dark:text-blue-400'
                          : log.action === 'edit'
                          ? 'bg-slate-500/10 text-slate-600 dark:text-slate-300'
                          : log.action === 'delete'
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-slate-500/10 text-slate-500'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.documents ? (
                      <p className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{log.documents.title}</p>
                    ) : (
                      <p className="text-slate-400 italic font-sans text-xs">Asset purged or N/A</p>
                    )}
                    {log.document_id && (
                      <p className="text-[10px] text-slate-400 mt-1">ID: {log.document_id.split('-')[0]}...</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-normal break-words text-slate-600 dark:text-slate-400 text-xs max-w-md">
                    {log.metadata?.details || log.metadata?.title || '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400 text-[10px]">
                    {log.user_id ? log.user_id.split('-')[0] : 'system'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
