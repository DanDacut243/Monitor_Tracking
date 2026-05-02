'use client'

import { useState, useRef } from 'react'
import { createDocument } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { useToast } from '@/app/components/ToastProvider'

interface RecentDoc {
  id: string
  title: string
  created_at: string
}

export default function UploadClient({
  clients,
  documentTypes,
  recentDocuments = [],
}: {
  clients: any[]
  documentTypes: any[]
  recentDocuments?: RecentDoc[]
}) {
  const router = useRouter()
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) setSelectedFile(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    if (selectedFile) {
      formData.set('file_path', `uploads/${selectedFile.name}`)
    }
    try {
      await createDocument(formData)
      toast('Document submitted to vault successfully', 'success')
      formRef.current?.reset()
      setSelectedFile(null)
      router.refresh()
    } catch (error: any) {
      toast(error?.message || 'Failed to upload document', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      {/* Left: Drop Zone + Batch History */}
      <div className="lg:col-span-7 h-full">
        {/* Drop Zone */}
        <div
          className={`bg-slate-50 dark:bg-slate-900 p-8 rounded-xl flex flex-col justify-center items-center border-2 border-dashed transition-all duration-300 group cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              : 'border-slate-300 dark:border-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:border-blue-400'
          }`}
          style={{ height: '320px' }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg,.heic,.doc,.docx"
            onChange={handleFileChange}
          />
          <div className="w-24 h-24 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center shadow-sm mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-4xl text-primary dark:text-blue-400">
              {selectedFile ? 'insert_drive_file' : 'cloud_upload'}
            </span>
          </div>
          {selectedFile ? (
            <>
              <h3 className="text-lg font-semibold font-headline text-emerald-600 dark:text-emerald-400 mb-1">
                File Selected
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{selectedFile.name}</p>
              <p className="text-xs text-slate-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                className="mt-4 text-xs text-red-500 hover:underline"
              >
                Remove file
              </button>
            </>
          ) : (
            <>
              <h3 className="text-xl font-semibold font-headline text-primary dark:text-blue-400 mb-2">
                Drop document to vault
              </h3>
              <p className="text-slate-500 text-center max-w-xs mb-6 text-sm">
                PDF, XLSX, HEIC up to 50MB. Drag &amp; drop or click to browse.
              </p>
              <button
                type="button"
                className="bg-slate-200 dark:bg-slate-800 px-8 py-3 rounded-lg font-semibold text-primary dark:text-blue-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              >
                <span className="material-symbols-outlined">folder_open</span>
                Browse Files
              </button>
            </>
          )}
        </div>

        {/* Feature badges */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[
            { icon: 'verified_user', label: 'Encrypted', color: 'text-amber-500' },
            { icon: 'analytics', label: 'Auto-Tagged', color: 'text-blue-500' },
            { icon: 'inventory_2', label: 'Archival', color: 'text-emerald-500' },
          ].map((f) => (
            <div key={f.label} className="bg-white dark:bg-slate-950 p-4 rounded-lg flex items-center gap-3 border border-slate-100 dark:border-slate-800">
              <span className={`material-symbols-outlined ${f.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {f.icon}
              </span>
              <span className="text-[10px] font-bold font-label uppercase text-slate-500">{f.label}</span>
            </div>
          ))}
        </div>

        {/* Recent Uploads — Dynamic from Supabase */}
        {recentDocuments.length > 0 && (
          <div className="mt-8">
            <h4 className="text-sm font-bold font-label text-slate-400 uppercase tracking-widest mb-4">Recent Uploads</h4>
            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {recentDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="min-w-[200px] bg-white dark:bg-slate-950 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <span
                    className="material-symbols-outlined text-sm text-emerald-500"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <p className="text-xs font-bold mt-2 truncate text-slate-900 dark:text-slate-100">{doc.title}</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Metadata Form */}
      <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold font-headline mb-6 flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <span className="material-symbols-outlined text-primary dark:text-blue-400">edit_note</span>
          Asset Classification
        </h3>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              name="title"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none"
              placeholder="e.g. Q3 Tax Reconciliation"
              type="text"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Description</label>
            <textarea
              name="description"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 text-slate-900 dark:text-slate-100 outline-none"
              placeholder="Summary of contents..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Document Type</label>
              <div className="relative">
                <select
                  name="type_id"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm appearance-none text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="">Uncategorized</option>
                  {documentTypes.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Fiscal Year</label>
              <input
                required
                name="year"
                type="number"
                defaultValue={new Date().getFullYear()}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Client Reference</label>
            <div className="relative">
              <select
                name="client_id"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-sm appearance-none text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="">No Client (Internal)</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">group</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold font-label text-slate-500 uppercase tracking-wider block mb-2">Total Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">$</span>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-4 py-3 text-sm font-mono text-slate-900 dark:text-slate-100 outline-none"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              id="submit-document-btn"
              disabled={isSubmitting}
              type="submit"
              className="w-full premium-gradient text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Uploading to Vault...
                </>
              ) : (
                <>
                  Submit Document
                  <span className="material-symbols-outlined">send</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-4 uppercase font-bold tracking-widest opacity-60">
              Authorized submission will be logged in audit trail
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
