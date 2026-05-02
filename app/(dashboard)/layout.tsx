import { Sidebar } from '../components/Sidebar'
import { TopNavBar } from '../components/TopNavBar'
import { ToastProvider } from '../components/ToastProvider'
import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = (profile?.role as 'admin' | 'accountant' | 'viewer') || 'viewer'

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#f7f9fb] dark:bg-slate-950 w-full">
        <Sidebar role={role} />
        <main className="ml-64 min-h-screen flex-[1] flex flex-col w-full">
          <TopNavBar role={role} />
          <div className="p-8 max-w-7xl mx-auto w-full flex-[1]">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}
