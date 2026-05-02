import { getDocumentTypes } from '@/lib/api'
import { getAllProfiles } from '@/app/actions'
import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'

export const revalidate = 0

export default async function SettingsPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const role = profile?.role || 'viewer'

  // Only admins can access settings
  if (role !== 'admin') redirect('/')

  const [documentTypes, profiles] = await Promise.all([
    getDocumentTypes(),
    getAllProfiles().catch(() => []),
  ])

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-extrabold font-headline tracking-tight text-primary dark:text-blue-400">
          System Configuration
        </h2>
        <p className="text-on-secondary-container dark:text-slate-400 mt-2 font-body">
          Manage vault taxonomies, retention rules, and access policies.
        </p>
      </header>

      <SettingsClient
        initialTypes={documentTypes || []}
        initialProfiles={profiles || []}
        currentUserId={user.id}
      />
    </div>
  )
}
