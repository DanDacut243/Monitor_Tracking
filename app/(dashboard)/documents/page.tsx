import { getDocuments, getClients, getDocumentTypes } from '@/lib/api'
import { createSupabaseServer } from '@/lib/supabase-server'
import DocumentsClient from './DocumentsClient'
import { Suspense } from 'react'

export const revalidate = 0

export default async function DocumentsPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let role = 'viewer'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role) role = profile.role
  }

  const [documents, clients, documentTypes] = await Promise.all([
    getDocuments(),
    getClients(),
    getDocumentTypes(),
  ])

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline tracking-tight text-primary dark:text-blue-400">
            Document Inventory
          </h2>
          <p className="text-on-secondary-container dark:text-slate-400 mt-2 font-body">
            Complete vault of all synced financial assets.
          </p>
        </div>
      </header>

      <Suspense fallback={<div className="text-slate-500 text-sm">Loading documents...</div>}>
        <DocumentsClient
          initialDocuments={documents || []}
          clients={clients || []}
          documentTypes={documentTypes || []}
          role={role as any}
        />
      </Suspense>
    </div>
  )
}
