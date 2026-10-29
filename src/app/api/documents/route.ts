import { NextRequest, NextResponse } from "next/server";
import { KnowledgeStore } from "@/lib/db/knowledge-store";
import { parseDocumentFile } from "@/lib/documents/parser";
import { chunkText } from "@/lib/documents/chunker";
import { AccessScope, Department, DocumentItem, UserRole } from "@/lib/types";

export const runtime = "nodejs";

// GET /api/documents - List documents with role-based filtering
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const department = (searchParams.get("department") as Department) || undefined;
    const role = (searchParams.get("role") as UserRole) || "admin";

    const docs = KnowledgeStore.getDocuments({
      search,
      category,
      department,
      role,
    });

    const categories = KnowledgeStore.getCategories();

    return NextResponse.json({
      documents: docs,
      categories,
      total: docs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST /api/documents - Upload and process a new document
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || file?.name || "Untitled Document";
    const description = (formData.get("description") as string) || "";
    const categoryId = (formData.get("category_id") as string) || "cat-sop";
    const department = ((formData.get("department") as string) || "General") as Department;
    const accessScope = ((formData.get("access_scope") as string) || "all") as AccessScope;
    const version = (formData.get("version") as string) || "1.0";
    const userRole = (formData.get("user_role") as string) || "admin";

    // 1. Authorization check: Employees cannot upload documents unless specifically granted
    if (userRole === "employee") {
      return NextResponse.json(
        { error: "Access denied. Only administrators are authorized to upload company documents." },
        { status: 403 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No file was provided in the upload request" }, { status: 400 });
    }

    // 2. Validate file type
    const validExtensions = [".pdf", ".docx", ".txt", ".md", ".csv"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      return NextResponse.json(
        {
          error: `Unsupported file format '${ext}'. KnowledgeOS supports ${validExtensions.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // 3. Validate file size (max 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds the 25MB limit. Uploaded size: ${(file.size / 1024 / 1024).toFixed(1)}MB` },
        { status: 400 }
      );
    }

    // 4. Extract Text
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let parsed;
    try {
      parsed = await parseDocumentFile(buffer, file.name, file.type);
    } catch (parseErr: any) {
      return NextResponse.json(
        { error: `Document text extraction failed: ${parseErr.message}` },
        { status: 422 }
      );
    }

    if (!parsed.text || parsed.text.trim().length === 0) {
      return NextResponse.json(
        { error: "The uploaded document contains no readable text" },
        { status: 422 }
      );
    }

    // 5. Generate Chunks
    const docId = `doc-${Date.now()}`;
    const categories = KnowledgeStore.getCategories();
    const categoryName = categories.find((c) => c.id === categoryId)?.name || "General";

    const chunks = chunkText(parsed.text, docId, title, categoryName, {
      chunkSize: 800,
      chunkOverlap: 150,
    });

    // 6. Create Document Record
    const newDoc: DocumentItem = {
      id: docId,
      organization_id: "org-acme-01",
      category_id: categoryId,
      category_name: categoryName,
      title: title.trim(),
      description: description.trim(),
      file_name: file.name,
      file_size_bytes: file.size,
      file_type: file.type || ext,
      version: version.trim(),
      department,
      access_scope: accessScope,
      status: "indexed",
      chunk_count: chunks.length,
      is_demo: false,
      created_by: "Sarah Chen (Admin)",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    KnowledgeStore.addDocument(newDoc, chunks);

    return NextResponse.json({
      success: true,
      document: newDoc,
      chunks_indexed: chunks.length,
      message: `Successfully indexed ${title} into ${chunks.length} searchable passages.`,
    });
  } catch (error: any) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process document upload" },
      { status: 500 }
    );
  }
}
