import { NextRequest, NextResponse } from "next/server";
import { KnowledgeStore } from "@/lib/db/knowledge-store";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = KnowledgeStore.reprocessDocument(id);
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    KnowledgeStore.logAuditEvent(
      "Document Reprocessed",
      `Triggered chunk re-indexing for ${doc.title}`,
      "Sarah Chen (Admin)"
    );

    return NextResponse.json({
      success: true,
      document: doc,
      message: `Document '${doc.title}' re-indexed successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
