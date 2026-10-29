import { NextRequest, NextResponse } from "next/server";
import { KnowledgeStore } from "@/lib/db/knowledge-store";
import { Department, UserRole } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const role = (searchParams.get("role") as UserRole) || "admin";
    const department = (searchParams.get("department") as Department) || "General";
    const topK = parseInt(searchParams.get("limit") || "6", 10);

    if (!query.trim()) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const chunks = KnowledgeStore.searchChunks(query, role, department, topK, 0.25);

    return NextResponse.json({
      query,
      results: chunks,
      total: chunks.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
