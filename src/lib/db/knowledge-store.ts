import { 
  DocumentItem, 
  DocumentChunk, 
  DocumentCategory, 
  Conversation, 
  ChatMessage, 
  UserProfile, 
  UserRole,
  Department
} from "@/lib/types";
import { MOCK_DOCUMENTS, MOCK_CHUNKS, MOCK_CATEGORIES, MOCK_USERS } from "./mock-data";

// In-memory runtime store for demo mode & serverless execution
interface RuntimeStore {
  documents: DocumentItem[];
  chunks: DocumentChunk[];
  categories: DocumentCategory[];
  conversations: Conversation[];
  messages: Record<string, ChatMessage[]>;
  auditEvents: Array<{
    id: string;
    timestamp: string;
    user_name: string;
    action: string;
    details: string;
  }>;
}

// Global singleton to persist across hot-reloads and API calls
const globalForStore = globalThis as unknown as { knowledgeStore?: RuntimeStore };

if (!globalForStore.knowledgeStore) {
  globalForStore.knowledgeStore = {
    documents: [...MOCK_DOCUMENTS],
    chunks: [...MOCK_CHUNKS],
    categories: [...MOCK_CATEGORIES],
    conversations: [
      {
        id: "conv-demo-01",
        organization_id: "org-acme-01",
        user_id: "usr-admin-01",
        title: "Client Onboarding & Pricing Rules",
        model_used: "google/gemini-2.0-flash-exp:free",
        provider_used: "openrouter",
        is_demo: true,
        created_at: "2025-01-20T10:00:00Z",
        updated_at: "2025-01-20T10:05:00Z",
      },
    ],
    messages: {
      "conv-demo-01": [
        {
          id: "msg-1",
          conversation_id: "conv-demo-01",
          role: "user",
          content: "What is our client onboarding process and how long does stage 2 take?",
          created_at: "2025-01-20T10:00:00Z",
        },
        {
          id: "msg-2",
          conversation_id: "conv-demo-01",
          role: "assistant",
          content: "According to our standard operating procedures, the onboarding process consists of **three sequential stages** [1]:\n\n1. **Stage 1: Pre-boarding & Credential Provisioning** (Days -5 to Day 1) — IT provisions encrypted hardware, 1Password, Okta SSO, and team workspace access [2].\n2. **Stage 2: Core Department Orientation & Shadowing** (Days 2 to 14) — Takes exactly **13 business days**. During this period, the new hire is paired with an Onboarding Buddy, shadows at least three customer ceremonies, and completes the Acme Architecture Walkthrough [3].\n3. **Stage 3: Independent Project Execution** (Days 15 to 30) — Focuses on starter deliverables and concludes with the formal 30-day review [4].",
          model_identifier: "google/gemini-2.0-flash-exp:free",
          tokens_used: 184,
          latency_ms: 620,
          created_at: "2025-01-20T10:00:03Z",
          source_references: [
            {
              citation_id: 1,
              document_id: "doc-onboarding-01",
              document_title: "Employee Onboarding SOP v3.2",
              category_name: "Standard Operating Procedures",
              page_number: 1,
              section_title: "Section 1: Onboarding Stages Overview",
              excerpt: "The Acme Technologies standard onboarding process consists of three sequential stages: Stage 1: Pre-boarding and Credential Provisioning (Days -5 to Day 1), Stage 2: Core Department Orientation and Shadowing (Days 2 to 14)...",
              similarity_score: 0.94,
            },
            {
              citation_id: 2,
              document_id: "doc-onboarding-01",
              document_title: "Employee Onboarding SOP v3.2",
              category_name: "Standard Operating Procedures",
              page_number: 2,
              section_title: "Section 2: Stage 1 Credential Provisioning",
              excerpt: "During Stage 1 (Days -5 to Day 1), IT Operations provisions hardware with encrypted storage, installs 1Password Enterprise, generates Okta Single Sign-On credentials...",
              similarity_score: 0.91,
            },
            {
              citation_id: 3,
              document_id: "doc-onboarding-01",
              document_title: "Employee Onboarding SOP v3.2",
              category_name: "Standard Operating Procedures",
              page_number: 3,
              section_title: "Section 3: Stage 2 Orientation & Shadowing Duration",
              excerpt: "Stage 2 takes exactly 13 business days (spanning Day 2 through Day 14). The new hire is paired with an assigned Onboarding Buddy...",
              similarity_score: 0.98,
            },
            {
              citation_id: 4,
              document_id: "doc-onboarding-01",
              document_title: "Employee Onboarding SOP v3.2",
              category_name: "Standard Operating Procedures",
              page_number: 4,
              section_title: "Section 4: Stage 3 Independent Milestone & Sign-off",
              excerpt: "Stage 3 (Days 15 to 30) focuses on delivering a bounded starter task. By Day 30, the manager conducts the formal 30-day review...",
              similarity_score: 0.89,
            },
          ],
        },
      ],
    },
    auditEvents: [
      {
        id: "evt-1",
        timestamp: "2025-01-20T10:00:00Z",
        user_name: "Sarah Chen (Admin)",
        action: "Query Executed",
        details: "Asked about client onboarding process with citations",
      },
      {
        id: "evt-2",
        timestamp: "2025-01-18T16:00:00Z",
        user_name: "Sarah Chen (Admin)",
        action: "Document Indexed",
        details: "Indexed Client Service Packages & Pricing Schedule 2025",
      },
      {
        id: "evt-3",
        timestamp: "2025-01-15T14:30:00Z",
        user_name: "Sarah Chen (Admin)",
        action: "Document Indexed",
        details: "Indexed Employee Onboarding SOP v3.2",
      },
    ],
  };
}

const store = globalForStore.knowledgeStore!;

export class KnowledgeStore {
  // --- Category Methods ---
  static getCategories(): DocumentCategory[] {
    return store.categories;
  }

  // --- Document Methods ---
  static getDocuments(filters?: {
    search?: string;
    category?: string;
    department?: Department;
    role?: UserRole;
    user_id?: string;
  }): DocumentItem[] {
    let docs = [...store.documents];

    // Access control filtering:
    // If user is employee (not admin), hide documents where access_scope == 'admin'
    if (filters?.role === "employee") {
      docs = docs.filter((d) => d.access_scope !== "admin");
    }

    // Category filter
    if (filters?.category && filters.category !== "all") {
      docs = docs.filter(
        (d) => d.category_id === filters.category || d.category_name?.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    // Search query filter
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.file_name.toLowerCase().includes(q)
      );
    }

    return docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static getDocumentById(id: string): DocumentItem | undefined {
    return store.documents.find((d) => d.id === id);
  }

  static addDocument(doc: DocumentItem, chunks: DocumentChunk[]): DocumentItem {
    store.documents.unshift(doc);
    store.chunks.push(...chunks);
    this.logAuditEvent(
      "Document Uploaded & Indexed",
      `Indexed document: ${doc.title} (${chunks.length} chunks generated)`,
      doc.created_by || "Admin"
    );
    return doc;
  }

  static updateDocument(id: string, updates: Partial<DocumentItem>): DocumentItem | null {
    const idx = store.documents.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    store.documents[idx] = {
      ...store.documents[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return store.documents[idx];
  }

  static deleteDocument(id: string): boolean {
    const doc = store.documents.find((d) => d.id === id);
    if (!doc) return false;

    // Purge document
    store.documents = store.documents.filter((d) => d.id !== id);
    // Purge all associated chunks immediately so obsolete chunks can never appear in search results
    store.chunks = store.chunks.filter((c) => c.document_id !== id);

    this.logAuditEvent(
      "Document Deleted",
      `Deleted document: ${doc.title} and purged all associated chunks`,
      "Admin"
    );
    return true;
  }

  static reprocessDocument(id: string): DocumentItem | null {
    const doc = store.documents.find((d) => d.id === id);
    if (!doc) return null;
    doc.status = "indexed";
    doc.updated_at = new Date().toISOString();
    return doc;
  }

  static getChunksByDocumentId(documentId: string): DocumentChunk[] {
    return store.chunks.filter((c) => c.document_id === documentId);
  }

  // --- Intelligent RAG Retrieval with Role-Based Access Control ---
  static searchChunks(
    query: string,
    userRole: UserRole = "admin",
    userDepartment: Department = "General",
    topK: number = 5,
    minSimilarity: number = 0.4
  ): DocumentChunk[] {
    const STOP_WORDS = new Set([
      "what", "is", "are", "our", "the", "and", "for", "with", "about", "from",
      "how", "does", "take", "this", "that", "there", "have", "been", "will", "when"
    ]);
    const queryTokens = query
      .toLowerCase()
      .split(/\s+/)
      .map((t) => t.replace(/[^a-z0-9]/g, ""))
      .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
    const queryLower = query.toLowerCase();

    // 1. Gather all authorized documents
    const allowedDocsMap = new Map<string, DocumentItem>();
    for (const doc of store.documents) {
      if (doc.status !== "indexed") continue;

      // Access control gate:
      if (doc.access_scope === "admin" && userRole !== "admin") {
        continue; // Block employee from retrieving admin-only confidential documents
      }

      if (doc.access_scope === "department" && userRole !== "admin") {
        if (doc.department !== userDepartment && !doc.allowed_departments?.includes(userDepartment)) {
          continue; // Block employee from other department private documents
        }
      }

      allowedDocsMap.set(doc.id, doc);
    }

    // 2. Score chunks belonging ONLY to allowed documents
    const scoredChunks: Array<{ chunk: DocumentChunk; score: number }> = [];

    for (const chunk of store.chunks) {
      const parentDoc = allowedDocsMap.get(chunk.document_id);
      if (!parentDoc) continue; // Skip unauthorized chunks

      const contentLower = chunk.content.toLowerCase();
      const titleLower = chunk.document_title.toLowerCase();
      const sectionLower = (chunk.section_title || "").toLowerCase();

      let score = 0;

      // Exact phrase match bonus
      if (queryLower.length > 5 && contentLower.includes(queryLower)) {
        score += 0.55;
      }

      // Keyword token scoring
      let tokenMatches = 0;
      for (const token of queryTokens) {
        if (contentLower.includes(token)) {
          tokenMatches++;
          score += 0.2;
        }
        if (sectionLower.includes(token)) {
          score += 0.2;
        }
        if (titleLower.includes(token)) {
          score += 0.2;
        }
      }

      // If no query tokens matched content, score remains 0 (prevents spurious matches)
      if (tokenMatches === 0 && !contentLower.includes(queryLower)) {
        continue;
      }

      // Normalization
      if (queryTokens.length > 0) {
        const matchRatio = tokenMatches / queryTokens.length;
        score = Math.min(0.99, score + matchRatio * 0.4);
      }

      // Semantic proximity boost for key industry terms
      const keySynonyms: Record<string, string[]> = {
        onboard: ["stage", "hire", "orientation", "buddy", "credential", "day"],
        price: ["package", "month", "retainer", "rate", "hourly", "overage", "tier"],
        pricing: ["package", "month", "retainer", "rate", "hourly", "overage", "tier"],
        refund: ["cancellation", "deposit", "sow", "terminate", "credit"],
        cancel: ["cancellation", "refund", "notice", "days"],
        expense: ["stipend", "allowance", "reimbursement", "travel", "meal", "per diem"],
        incident: ["p1", "p2", "severity", "postmortem", "outage", "escalation"],
        compensation: ["equity", "severance", "board", "director", "executive"],
      };

      for (const [key, related] of Object.entries(keySynonyms)) {
        if (queryLower.includes(key)) {
          for (const rel of related) {
            if (contentLower.includes(rel)) {
              score += 0.1;
            }
          }
        }
      }

      if (score >= minSimilarity) {
        scoredChunks.push({
          chunk: {
            ...chunk,
            similarity: Math.min(0.99, Number(score.toFixed(2))),
          },
          score,
        });
      }
    }

    // Sort by score descending and take topK
    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, topK).map((sc) => sc.chunk);
  }

  // --- Conversation Management ---
  static getConversations(userId?: string): Conversation[] {
    return store.conversations.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }

  static getConversationById(id: string): Conversation | undefined {
    return store.conversations.find((c) => c.id === id);
  }

  static createConversation(data: Partial<Conversation>): Conversation {
    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      organization_id: data.organization_id || "org-acme-01",
      user_id: data.user_id || "usr-admin-01",
      title: data.title || "New Conversation",
      model_used: data.model_used || "google/gemini-2.0-flash-exp:free",
      provider_used: data.provider_used || "openrouter",
      is_demo: data.is_demo ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.conversations.unshift(newConv);
    store.messages[newConv.id] = [];
    return newConv;
  }

  static updateConversation(id: string, updates: Partial<Conversation>): Conversation | null {
    const idx = store.conversations.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    store.conversations[idx] = {
      ...store.conversations[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return store.conversations[idx];
  }

  static deleteConversation(id: string): boolean {
    const idx = store.conversations.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    store.conversations.splice(idx, 1);
    delete store.messages[id];
    return true;
  }

  static clearAllConversations(): void {
    store.conversations = [];
    store.messages = {};
  }

  // --- Message Management ---
  static getMessages(conversationId: string): ChatMessage[] {
    return store.messages[conversationId] || [];
  }

  static addMessage(conversationId: string, message: Partial<ChatMessage>): ChatMessage {
    if (!store.messages[conversationId]) {
      store.messages[conversationId] = [];
    }
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversation_id: conversationId,
      role: message.role || "user",
      content: message.content || "",
      source_references: message.source_references || [],
      model_identifier: message.model_identifier,
      tokens_used: message.tokens_used || 0,
      latency_ms: message.latency_ms || 0,
      created_at: new Date().toISOString(),
    };
    store.messages[conversationId].push(newMsg);

    // Update conversation timestamp
    const conv = store.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.updated_at = new Date().toISOString();
      // If title is default, generate title from first message
      if (conv.title === "New Conversation" && message.role === "user") {
        conv.title = message.content?.slice(0, 36) + (message.content && message.content.length > 36 ? "…" : "");
      }
    }

    return newMsg;
  }

  // --- Audit Events ---
  static logAuditEvent(action: string, details: string, userName = "Sarah Chen (Admin)"): void {
    store.auditEvents.unshift({
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_name: userName,
      action,
      details,
    });
    if (store.auditEvents.length > 100) {
      store.auditEvents.pop();
    }
  }

  static getAuditEvents() {
    return store.auditEvents;
  }
}
