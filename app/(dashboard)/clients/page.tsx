import { getClients, getDocumentCountsByClient } from '@/lib/api'
import { createSupabaseServer } from '@/lib/supabase-server'
import ClientsClient from './ClientsClient'

export const revalidate = 0

export default async function ClientsPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let role = 'viewer'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role) role = profile.role
  }

  const [clients, documentCounts] = await Promise.all([
    getClients(),
    getDocumentCountsByClient(),
  ])

  const countsMap = documentCounts?.reduce((acc: any, curr: any) => {
    acc[curr.client_id] = curr.count
    return acc
  }, {})

  const clientsWithCounts = clients?.map((client: any) => ({
    ...client,
    documentCount: countsMap?.[client.id] || 0,
  }))

  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold font-headline tracking-tight text-primary dark:text-blue-400">
            Client Directory
          </h2>
          <p className="text-on-secondary-container dark:text-slate-400 mt-2 font-body">
            Manage entities, vendors, and their associated documentation.
          </p>
        </div>
      </header>

      <ClientsClient initialClients={clientsWithCounts || []} role={role as any} />
    </div>
  )
}
