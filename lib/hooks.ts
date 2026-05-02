'use client'

import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { useRouter } from 'next/navigation'

export function useRealtimeStats() {
  const router = useRouter()

  useEffect(() => {
    const channel1 = supabase.channel('realtime_documents_stats').on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => router.refresh()).subscribe()
    const channel2 = supabase.channel('realtime_clients_stats').on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => router.refresh()).subscribe()
    return () => {
      supabase.removeChannel(channel1)
      supabase.removeChannel(channel2)
    }
  }, [router])
}

export function useRealtimeDocuments() {
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel('realtime_documents')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        (payload) => {
          console.log('Document change received!', payload)
          router.refresh() // Refresh server components to fetch new data
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])
}

export function useRealtimeAuditLogs() {
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel('realtime_audit_logs')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          console.log('New audit log received!', payload)
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])
}

export function useRealtimeClients() {
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel('realtime_clients')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        (payload) => {
          console.log('Client change received!', payload)
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])
}

export function useRealtimeAll() {
  useRealtimeDocuments();
  useRealtimeAuditLogs();
  useRealtimeClients();
}

export function useRealtimeDocumentTypes() {
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel('realtime_document_types')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'document_types' },
        (payload) => {
          console.log('Document type change received!', payload)
          router.refresh()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [router])
}
