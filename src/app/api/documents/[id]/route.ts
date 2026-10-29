import { NextRequest, NextResponse } from "next/server";
import { KnowledgeStore } from "@/lib/db/knowledge-store";

export const runtime = "nodejs";

// GET /api/documents/[id] - Retrieve single document details and chunk list
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = KnowledgeStore.getDocumentById(id);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const chunks = KnowledgeStore.getChunksByDocumentId(id);

    return NextResponse.json({
      document: doc,
      chunks,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/documents/[id] - Update document metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = KnowledgeStore.updateDocument(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, document: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/documents/[id] - Delete document and purge all chunks
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const role = req.headers.get("x-user-role") || "admin";

    if (role === "employee") {
      return NextResponse.json(
        { error: "Unauthorized. Employees cannot delete company documents." },
        { status: 403 }
      );
    }

    const success = KnowledgeStore.deleteDocument(id);
    if (!success) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Document and all associated chunks permanently removed.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
