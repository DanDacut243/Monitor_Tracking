'use client'

import { useState } from 'react'
import { createClient, deleteClient } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { useRealtimeClients } from '@/lib/hooks'
import { useToast } from '@/app/components/ToastProvider'
import { ConfirmModal } from '@/app/components/ConfirmModal'

type Role = 'admin' | 'accountant' | 'viewer'

export default function ClientsClient({
  initialClients,
  role = 'viewer',
}: {
  initialClients: any[]
  role?: Role
}) {
  const router = useRouter()
  const toast = useToast()
  useRealtimeClients()

  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null)

  const canManage = role === 'admin' || role === 'accountant'

  const filteredClients = initialClients.filter(
    (client: any) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.contact_email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createClient(formData)
      setIsCreating(false)
      router.refresh()
      toast('Client onboarded successfully', 'success')
    } catch (error: any) {
      toast(error?.message || 'Failed to create client', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingClientId) return
    try {
      await deleteClient(deletingClientId)
      setDeletingClientId(null)
      router.refresh()
      toast('Client removed', 'success')
    } catch (error: any) {
      toast(error?.message || 'Failed to delete client', 'error')
      setDeletingClientId(null)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 flex-col sm:flex-row gap-4">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
            <input
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none"
              placeholder="Search clients or emails..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {canManage && (
            <button
              id="new-client-btn"
              onClick={() => setIsCreating(true)}
              className="premium-gradient text-white px-5 py-2 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Client
            </button>
          )}
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20">Client Entity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20">Contact Info</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20 text-right">Documents</th>
                {canManage && <th className="px-6 py-4 w-16 bg-slate-50 dark:bg-slate-800/20" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 4 : 3} className="py-16 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 block mb-3">group_off</span>
                    <p className="text-slate-500 font-medium">No clients found.</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client: any) => (
                  <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                          {client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                            {client.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">
                            ID: {client.id.split('-')[0]}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {client.contact_email ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined text-[16px]">mail</span>
                          {client.contact_email}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400 italic">No email</span>
                      )}
                      {client.contact_phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <span className="material-symbols-outlined text-[16px]">call</span>
                          {client.contact_phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700">
                        {client.documentCount} Assets
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-center">
                        {role === 'admin' && (
                          <button
                            id={`delete-client-${client.id}`}
                            onClick={() => setDeletingClientId(client.id)}
                            className="w-8 h-8 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-center text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Client Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold font-headline text-lg text-slate-900 dark:text-slate-100">Onboard New Client</h3>
              <button type="button" onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Entity Name</label>
                <input required name="name" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none" type="text" placeholder="e.g. Acme Corp" />
              </div>
              <div>
                <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Primary Email</label>
                <input name="contact_email" type="email" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none" placeholder="billing@acme.com" />
              </div>
              <div>
                <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Phone Number</label>
                <input name="contact_phone" type="tel" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="premium-gradient text-white px-6 py-2 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  {isSubmitting ? 'Onboarding...' : 'Onboard Entity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deletingClientId && (
        <ConfirmModal
          title="Remove Client"
          message="This will permanently remove the client. Associated documents will remain but lose their client reference."
          confirmLabel="Yes, Remove"
          cancelLabel="Cancel"
          destructive
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingClientId(null)}
        />
      )}
    </>
  )
}
