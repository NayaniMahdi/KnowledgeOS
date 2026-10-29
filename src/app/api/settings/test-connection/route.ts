import { NextRequest, NextResponse } from "next/server";
import { LLMProviderService } from "@/lib/ai/provider";
import { KnowledgeStore } from "@/lib/db/knowledge-store";
import { AIProvider } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, customApiKey } = body;

    if (!provider || (provider !== "nvidia" && provider !== "openrouter")) {
      return NextResponse.json(
        { error: "Invalid provider. Must be 'nvidia' or 'openrouter'" },
        { status: 400 }
      );
    }

    const result = await LLMProviderService.testConnection(
      provider as AIProvider,
      customApiKey
    );

    KnowledgeStore.logAuditEvent(
      `Provider Connection Test: ${provider.toUpperCase()}`,
      `Status: ${result.success ? "Success" : "Failed"} (${result.latency_ms}ms, model: ${result.model_tested})`,
      "Sarah Chen (Admin)"
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, latency_ms: 0, error: error.message },
      { status: 500 }
    );
  }
}
