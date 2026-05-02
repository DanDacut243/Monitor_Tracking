'use server'

import { createSupabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Helper to get authenticated supabase + current user
async function getServerContext() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

// Generic function to insert audit log with user_id
async function logAction(
  supabase: any,
  userId: string | null,
  action: 'upload' | 'view' | 'edit' | 'delete',
  documentId: string | null = null,
  details: string | null = null
) {
  await supabase.from('audit_logs').insert([
    {
      action,
      document_id: documentId,
      user_id: userId,
      metadata: details ? { details } : null,
    },
  ])
}

// ------ DOCUMENTS ------

export async function createDocument(formData: FormData) {
  const { supabase, user } = await getServerContext()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const file_path = formData.get('file_path') as string
  const type_id = (formData.get('type_id') as string) || null
  const client_id = (formData.get('client_id') as string) || null
  const amountStr = formData.get('amount') as string
  const yearStr = formData.get('year') as string

  const amount = amountStr ? parseFloat(amountStr) : null
  const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear()

  const { data, error } = await supabase
    .from('documents')
    .insert([
      {
        title,
        description,
        file_path: file_path || 'uploads/pending.pdf',
        type_id: type_id || null,
        client_id: client_id || null,
        amount,
        year,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)

  await logAction(supabase, user?.id ?? null, 'upload', data.id, `Uploaded: ${title}`)
  revalidatePath('/')
  revalidatePath('/documents')
  return data
}

export async function updateDocument(id: string, formData: FormData) {
  const { supabase, user } = await getServerContext()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const client_id = (formData.get('client_id') as string) || null
  const type_id = (formData.get('type_id') as string) || null
  const amountStr = formData.get('amount') as string
  const yearStr = formData.get('year') as string
  const amount = amountStr ? parseFloat(amountStr) : null
  const year = yearStr ? parseInt(yearStr, 10) : null

  const { data, error } = await supabase
    .from('documents')
    .update({
      title,
      description,
      client_id: client_id || null,
      type_id: type_id || null,
      amount,
      year,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)

  await logAction(supabase, user?.id ?? null, 'edit', id, `Edited: ${title}`)
  revalidatePath('/')
  revalidatePath('/documents')
  return data
}

export async function deleteDocument(id: string) {
  const { supabase, user } = await getServerContext()

  // Fetch title before deleting for the log
  const { data: doc } = await supabase.from('documents').select('title').eq('id', id).single()

  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw new Error(error.message)

  await logAction(supabase, user?.id ?? null, 'delete', id, `Deleted: ${doc?.title ?? 'Unknown'}`)
  revalidatePath('/')
  revalidatePath('/documents')
}

// ------ CLIENTS ------

export async function createClient(formData: FormData) {
  const { supabase } = await getServerContext()

  const name = formData.get('name') as string
  const contact_email = (formData.get('contact_email') as string) || null
  const contact_phone = (formData.get('contact_phone') as string) || null

  const { data, error } = await supabase
    .from('clients')
    .insert([{ name, contact_email, contact_phone }])
    .select()

  if (error) throw new Error(error.message)

  revalidatePath('/clients')
  revalidatePath('/documents')
  return data
}

export async function deleteClient(id: string) {
  const { supabase } = await getServerContext()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/clients')
}

// ------ DOCUMENT TYPES ------

export async function createDocumentType(formData: FormData) {
  const { supabase } = await getServerContext()

  const name = formData.get('name') as string

  const { data, error } = await supabase
    .from('document_types')
    .insert([{ name }])
    .select()

  if (error) throw new Error(error.message)

  revalidatePath('/settings')
  revalidatePath('/documents')
  return data
}

export async function deleteDocumentType(id: string) {
  const { supabase } = await getServerContext()
  const { error } = await supabase.from('document_types').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/settings')
}

// ------ USER MANAGEMENT (Admin Only) ------

export async function updateUserRole(userId: string, newRole: 'admin' | 'accountant' | 'viewer') {
  const { supabase, user } = await getServerContext()

  // Verify caller is admin
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can change roles')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/settings')
}

export async function getAllProfiles() {
  const { supabase, user } = await getServerContext()

  // Verify caller is admin
  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (callerProfile?.role !== 'admin') {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}
