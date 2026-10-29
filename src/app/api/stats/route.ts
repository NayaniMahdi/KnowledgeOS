import { NextResponse } from "next/server";
import { KnowledgeStore } from "@/lib/db/knowledge-store";
import { LLMProviderService } from "@/lib/ai/provider";

export const runtime = "nodejs";

export async function GET() {
  try {
    const docs = KnowledgeStore.getDocuments();
    const convs = KnowledgeStore.getConversations();
    const audits = KnowledgeStore.getAuditEvents();

    let totalChunks = 0;
    for (const d of docs) {
      totalChunks += d.chunk_count;
    }

    const hasNvidiaKey = Boolean(LLMProviderService.getApiKey("nvidia"));
    const hasOpenRouterKey = Boolean(LLMProviderService.getApiKey("openrouter"));

    return NextResponse.json({
      documents_count: docs.length,
      chunks_count: totalChunks,
      conversations_count: convs.length,
      audit_events_count: audits.length,
      has_nvidia_key: hasNvidiaKey,
      has_openrouter_key: hasOpenRouterKey,
      recent_audits: audits.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
