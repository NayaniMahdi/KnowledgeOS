import { NextRequest, NextResponse } from "next/server";
import { KnowledgeStore } from "@/lib/db/knowledge-store";
import { AIProvider } from "@/lib/types";

export const runtime = "nodejs";

// GET /api/conversations - List conversations
export async function GET() {
  try {
    const convs = KnowledgeStore.getConversations();
    return NextResponse.json({ conversations: convs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const conv = KnowledgeStore.createConversation({
      title: body.title || "New Conversation",
      model_used: body.model || "nvidia/nemotron-3.5-lightning-30b-a3b",
      provider_used: (body.provider as AIProvider) || "nvidia",
      is_demo: body.is_demo ?? true,
    });
    return NextResponse.json({ conversation: conv });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/conversations - Clear all conversations
export async function DELETE() {
  try {
    KnowledgeStore.clearAllConversations();
    return NextResponse.json({ success: true, message: "All conversations cleared." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
