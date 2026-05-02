import { supabase } from './supabase';

// Reusable data fetching functions
export async function getDashboardStats() {
  const [docsRes, clientsRes, logsRes] = await Promise.all([
    supabase.from('documents').select('id', { count: 'exact', head: true }),
    supabase.from('clients').select('id', { count: 'exact', head: true }),
    supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
  ]);

  // For recent uploads, let's just count documents created in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const { count: recentUploadsCount } = await supabase
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString());

  return {
    totalDocuments: docsRes.count || 0,
    totalClients: clientsRes.count || 0,
    recentUploads: recentUploadsCount || 0,
    totalAuditLogs: logsRes.count || 0,
  };
}

export async function getRecentDocuments(limit = 5) {
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_types (name),
      clients (name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getRecentAuditLogs(limit = 10) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      users (email),
      documents (title)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getDocuments() {
  const { data, error } = await supabase.from('documents').select('*, document_types(name), clients(name)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getClients() {
  const { data, error } = await supabase.from('clients').select('*').order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getDocumentTypes() {
  const { data, error } = await supabase.from('document_types').select('*').order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getDocumentCountsByClient() {
  const { data, error } = await supabase.from('documents').select('client_id');
  if (error) throw error;
  
  // Basic aggregation since Supabase RPC might not be set up
  const counts = data.reduce((acc: any, doc: any) => {
    if (doc.client_id) {
      acc[doc.client_id] = (acc[doc.client_id] || 0) + 1;
    }
    return acc;
  }, {});
  
  return Object.keys(counts).map(client_id => ({
    client_id,
    count: counts[client_id]
  }));
}

export const getRecentActivity = getRecentAuditLogs;
export const getStats = getDashboardStats;

