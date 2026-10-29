export type UserRole = 'admin' | 'employee';

export type Department = 
  | 'Executive' 
  | 'Engineering' 
  | 'Sales' 
  | 'HR' 
  | 'Legal' 
  | 'Operations' 
  | 'Finance' 
  | 'General';

export interface UserProfile {
  id: string;
  organization_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: Department;
  avatar_url?: string;
  created_at?: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
}

export type DocumentStatus = 
  | 'uploaded' 
  | 'processing' 
  | 'indexed' 
  | 'failed' 
  | 'needs_reprocessing';

export type AccessScope = 'all' | 'department' | 'admin' | 'custom';

export interface DocumentItem {
  id: string;
  organization_id: string;
  category_id?: string;
  category_name?: string;
  title: string;
  description?: string;
  file_name: string;
  file_size_bytes: number;
  file_type: string;
  storage_path?: string;
  version: string;
  department: Department;
  access_scope: AccessScope;
  allowed_departments?: Department[];
  allowed_user_ids?: string[];
  status: DocumentStatus;
  error_message?: string;
  chunk_count: number;
  is_demo: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  document_title: string;
  category_name?: string;
  chunk_index: number;
  content: string;
  page_number?: number;
  section_title?: string;
  similarity?: number;
  metadata?: Record<string, any>;
}

export interface SourceCitation {
  citation_id: number;
  document_id: string;
  document_title: string;
  category_name?: string;
  page_number?: number;
  section_title?: string;
  excerpt: string;
  similarity_score: number;
  access_scope?: AccessScope;
}

export type AIProvider = 'nvidia' | 'openrouter';

export interface AIModelOption {
  id: string;
  name: string;
  provider: AIProvider;
  is_free?: boolean;
  context_length?: number;
  description?: string;
}

export interface Conversation {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  model_used: string;
  provider_used: AIProvider;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  source_references?: SourceCitation[];
  model_identifier?: string;
  tokens_used?: number;
  latency_ms?: number;
  created_at: string;
}

export interface AppSettings {
  app_name: string;
  organization_name: string;
  theme: 'system' | 'light' | 'dark';
  demo_mode: boolean;
  default_provider: AIProvider;
  default_model: string;
  embedding_model: string;
  chunk_size: number;
  chunk_overlap: number;
  similarity_threshold: number;
  top_k: number;
  has_nvidia_key: boolean;
  has_openrouter_key: boolean;
}

export interface ProviderConnectionStatus {
  provider: AIProvider;
  connected: boolean;
  model_tested?: string;
  latency_ms?: number;
  error?: string;
  checked_at: string;
}
