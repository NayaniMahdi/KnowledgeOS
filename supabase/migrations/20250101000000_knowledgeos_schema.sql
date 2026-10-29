-- ==============================================================================
-- KnowledgeOS Database Schema
-- Multi-tenant, RAG-enabled Enterprise Knowledge Assistant
-- Compatible with PostgreSQL 15+ and Supabase with pgvector
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    settings JSONB DEFAULT '{
        "allowed_file_types": [".pdf", ".docx", ".txt", ".md", ".csv"],
        "max_file_size_mb": 25,
        "chunk_size": 800,
        "chunk_overlap": 150,
        "default_similarity_threshold": 0.65,
        "default_top_k": 5
    }'::jsonb,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Users Table (Linked with auth.users if using Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    department VARCHAR(100) NOT NULL DEFAULT 'General' CHECK (department IN ('Executive', 'Engineering', 'Sales', 'HR', 'Legal', 'Operations', 'Finance', 'General')),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{
        "theme": "system",
        "demo_mode": true
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, email)
);

-- 4. Document Categories Table
CREATE TABLE IF NOT EXISTS document_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(30) DEFAULT '#365C49',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, slug)
);

-- 5. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    file_type VARCHAR(50) NOT NULL,
    storage_path TEXT,
    version VARCHAR(50) DEFAULT '1.0',
    department VARCHAR(100) DEFAULT 'General',
    access_scope VARCHAR(50) NOT NULL DEFAULT 'all' CHECK (access_scope IN ('all', 'department', 'admin', 'custom')),
    allowed_departments TEXT[] DEFAULT '{}',
    allowed_user_ids UUID[] DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'indexed', 'failed', 'needs_reprocessing')),
    error_message TEXT,
    chunk_count INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_demo BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Document Chunks Table with Vector Embeddings (1536 dims standard for OpenAI / NVIDIA / OpenRouter compatible)
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    page_number INT,
    section_title TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding vector(1536),
    tsv_content tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    model_used VARCHAR(100),
    provider_used VARCHAR(50),
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Messages Table
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    source_references JSONB DEFAULT '[]'::jsonb,
    model_identifier VARCHAR(100),
    tokens_used INT DEFAULT 0,
    latency_ms INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Audit Events Table
CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Indexes for Fast Retrieval
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_chunks_doc_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_org_id ON document_chunks(organization_id);
CREATE INDEX IF NOT EXISTS idx_chunks_tsv ON document_chunks USING gin(tsv_content);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_id ON conversation_messages(conversation_id);

-- Vector similarity index (HNSW for rapid approximate nearest neighbors)
-- Note: Requires populated vectors to create effectively; creates index if table exists
CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw 
ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- ==============================================================================
-- Hybrid Search Function (Vector Cosine Distance + Full-Text Search)
-- ==============================================================================
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(1536),
  query_text text,
  match_count int DEFAULT 5,
  similarity_threshold float DEFAULT 0.5,
  filter_org_id uuid DEFAULT NULL,
  filter_departments text[] DEFAULT NULL,
  is_admin boolean DEFAULT FALSE,
  user_id_param uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  title varchar,
  content text,
  page_number int,
  section_title text,
  similarity float,
  access_scope varchar
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    d.title,
    dc.content,
    dc.page_number,
    dc.section_title,
    1 - (dc.embedding <=> query_embedding) AS similarity,
    d.access_scope
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE d.organization_id = filter_org_id
    AND d.status = 'indexed'
    AND (
      is_admin = TRUE
      OR d.access_scope = 'all'
      OR (d.access_scope = 'department' AND d.department = ANY(filter_departments))
      OR (d.access_scope = 'custom' AND (user_id_param = ANY(d.allowed_user_ids) OR d.department = ANY(filter_departments)))
    )
    AND (
      -- Cosine similarity condition
      (dc.embedding IS NOT NULL AND (1 - (dc.embedding <=> query_embedding)) >= similarity_threshold)
      OR
      -- Keyword fallback if vector is near threshold or for exact technical phrases
      (query_text <> '' AND dc.tsv_content @@ plainto_tsquery('english', query_text))
    )
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
