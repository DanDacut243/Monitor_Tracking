import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import UploadClient from './UploadClient'

export const revalidate = 0

export default async function UploadPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role || 'viewer'

  // Only admin and accountant can upload
  if (role === 'viewer') redirect('/')

  const [{ data: clients }, { data: documentTypes }, { data: recentDocuments }] = await Promise.all([
    supabase.from('clients').select('id, name').order('name'),
    supabase.from('document_types').select('id, name').order('name'),
    supabase
      .from('documents')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-primary dark:text-blue-400">
          Upload &amp; Classification
        </h2>
        <p className="text-on-secondary-container dark:text-slate-400 mt-2 font-body">
          Ingest new financial assets into the secure vault with automatic metadata tagging.
        </p>
      </header>

      <UploadClient
        clients={clients || []}
        documentTypes={documentTypes || []}
        recentDocuments={recentDocuments || []}
      />
    </div>
  )
}
