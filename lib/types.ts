export interface User {
  id: string;
  email: string;
  role: 'admin' | 'accountant' | 'viewer';
  created_at: string;
}

export interface DocumentType {
  id: string;
  name: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  type_id: string | null;
  client_id: string | null;
  year: number;
  amount: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Joined fields
  document_types?: DocumentType;
  clients?: Client;
  users?: User;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  file_path: string;
  version_number: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  document_id: string | null;
  action: 'upload' | 'view' | 'edit' | 'delete';
  metadata: Record<string, unknown> | null;
  created_at: string;
  // Joined fields
  users?: User;
  documents?: Document;
}

export interface DashboardStats {
  totalDocuments: number;
  totalClients: number;
  recentUploads: number;
  totalAuditLogs: number;
}
