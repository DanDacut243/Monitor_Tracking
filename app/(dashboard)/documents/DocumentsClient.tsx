'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { updateDocument, deleteDocument } from '@/app/actions'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRealtimeDocuments } from '@/lib/hooks'
import { useToast } from '@/app/components/ToastProvider'
import { ConfirmModal } from '@/app/components/ConfirmModal'

type Role = 'admin' | 'accountant' | 'viewer'

export default function DocumentsClient({
  initialDocuments,
  clients,
  documentTypes,
  role = 'viewer',
}: {
  initialDocuments: any[]
  clients: any[]
  documentTypes: any[]
  role?: Role
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  useRealtimeDocuments()

  const urlSearch = searchParams.get('search') || ''
  const [search, setSearch] = useState(urlSearch)
  const [editingDoc, setEditingDoc] = useState<any>(null)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const PAGE_SIZE = 10

  // Sync URL search param into state
  useEffect(() => {
    if (urlSearch) setSearch(urlSearch)
  }, [urlSearch])

  const filteredDocs = initialDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.description?.toLowerCase().includes(search.toLowerCase()) ||
      doc.clients?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filteredDocs.length / PAGE_SIZE)
  const paginatedDocs = filteredDocs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const canEdit = role === 'admin' || role === 'accountant'

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingDoc) return
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      await updateDocument(editingDoc.id, formData)
      setEditingDoc(null)
      router.refresh()
      toast('Document updated successfully', 'success')
    } catch (error: any) {
      toast(error?.message || 'Failed to update document', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingDocId) return
    try {
      await deleteDocument(deletingDocId)
      setDeletingDocId(null)
      router.refresh()
      toast('Document permanently deleted', 'success')
    } catch (error: any) {
      toast(error?.message || 'Failed to delete document', 'error')
      setDeletingDocId(null)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 flex-wrap gap-3">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              search
            </span>
            <input
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none"
              placeholder={`Search across ${initialDocuments.length} documents...`}
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            />
          </div>
          <div className="flex gap-2 items-center">
            {search && (
              <span className="text-xs text-slate-500 font-medium">
                {filteredDocs.length} result{filteredDocs.length !== 1 ? 's' : ''}
              </span>
            )}
            <button
              id="docs-view-toggle-btn"
              className="w-10 h-10 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary dark:hover:text-blue-400 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">view_column</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20">Document</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20">Entity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20">Metadata</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20 text-right">Amount / Date</th>
                {canEdit && <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/20 w-16" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="py-16 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 block mb-3">folder_open</span>
                    <p className="text-slate-500 font-medium">No documents found.</p>
                    {search && (
                      <button onClick={() => setSearch('')} className="text-xs text-primary dark:text-blue-400 mt-2 hover:underline">
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedDocs.map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-slate-500">description</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
                            {doc.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-[250px] truncate">
                            {doc.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {doc.clients?.name || 'Internal'}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">
                        Ref: {doc.id.split('-')[0]}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest rounded">
                          {doc.document_types?.name || 'Uncategorized'}
                        </span>
                        {doc.year && (
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-200 dark:border-slate-700">
                            FY {doc.year}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-sm font-bold tabular-nums text-slate-900 dark:text-slate-100">
                        {doc.amount ? `$${Number(doc.amount).toLocaleString()}` : '—'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {format(new Date(doc.created_at), 'MMM d, yyyy')}
                      </p>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            id={`edit-doc-${doc.id}`}
                            onClick={() => setEditingDoc(doc)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          {role === 'admin' && (
                            <button
                              id={`delete-doc-${doc.id}`}
                              onClick={() => setDeletingDocId(doc.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-sm">
          <p className="text-slate-500 font-medium">
            Showing {paginatedDocs.length} of {filteredDocs.length} assets (Page {page + 1} of{' '}
            {Math.max(totalPages, 1)})
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-bold font-headline text-lg text-slate-900 dark:text-slate-100">Edit Document</h3>
              <button type="button" onClick={() => setEditingDoc(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Title</label>
                <input required name="title" defaultValue={editingDoc.title} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none" type="text" />
              </div>
              <div>
                <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Description</label>
                <textarea name="description" defaultValue={editingDoc.description || ''} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Client</label>
                  <select name="client_id" defaultValue={editingDoc.client_id || ''} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none">
                    <option value="">No Client</option>
                    {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Type</label>
                  <select name="type_id" defaultValue={editingDoc.type_id || ''} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none">
                    <option value="">Uncategorized</option>
                    {documentTypes.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Year</label>
                  <input name="year" type="number" defaultValue={editingDoc.year || ''} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Amount</label>
                  <input name="amount" type="number" step="0.01" defaultValue={editingDoc.amount || ''} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm font-mono text-slate-900 dark:text-slate-100 outline-none" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditingDoc(null)} className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="premium-gradient text-white px-6 py-2 rounded-lg font-bold shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  {isSubmitting ? 'Saving...' : 'Update Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingDocId && (
        <ConfirmModal
          title="Delete Document"
          message="This action is permanent and cannot be undone. The document will be removed from the vault."
          confirmLabel="Yes, Delete"
          cancelLabel="Cancel"
          destructive
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingDocId(null)}
        />
      )}
    </>
  )
}
