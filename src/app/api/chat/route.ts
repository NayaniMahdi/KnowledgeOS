import { NextRequest, NextResponse } from "next/server";
import { KnowledgeStore } from "@/lib/db/knowledge-store";
import { LLMProviderService } from "@/lib/ai/provider";
import { AIProvider, Department, UserRole } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId: reqConvId,
      message,
      provider = "nvidia",
      model = "nvidia/nemotron-3.5-lightning-30b-a3b",
      userRole = "admin",
      userDepartment = "Executive",
    } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // 1. Ensure conversation exists
    let conversationId = reqConvId;
    const existingConv = conversationId ? KnowledgeStore.getConversationById(conversationId) : null;
    const isInitialTurn = !existingConv || !existingConv.title || existingConv.title === "New Conversation";

    if (!conversationId) {
      const newConv = KnowledgeStore.createConversation({
        title: "New Conversation",
        model_used: model,
        provider_used: provider as AIProvider,
        is_demo: true,
      });
      conversationId = newConv.id;
    }

    // Start title generation in background if it's the initial turn
    const titlePromise = isInitialTurn
      ? LLMProviderService.generateChatTitle(message.trim())
      : Promise.resolve(existingConv?.title || "Conversation");

    // 2. Add user message to conversation history
    KnowledgeStore.addMessage(conversationId, {
      role: "user",
      content: message.trim(),
    });

    // 3. Retrieve conversation history for context
    const previousMessages = KnowledgeStore.getMessages(conversationId).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 4. Perform Intelligent RAG Retrieval with Role & Department Security
    const retrievedChunks = KnowledgeStore.searchChunks(
      message.trim(),
      userRole as UserRole,
      userDepartment as Department,
      5,
      0.25 // threshold
    );

    // 5. Stream Completion from configured Provider (NVIDIA or OpenRouter, or grounded fallback)
    const startTime = Date.now();
    const { stream, sourceReferences, modelUsed, providerUsed, isFallback } =
      await LLMProviderService.streamChat({
        provider: provider as AIProvider,
        model,
        messages: previousMessages,
        retrievedChunks,
      });

    // Prepare custom streaming response with headers containing serialized citations
    const headers = new Headers();
    headers.set("Content-Type", "text/event-stream; charset=utf-8");
    headers.set("Cache-Control", "no-cache, no-transform");
    headers.set("Connection", "keep-alive");
    headers.set("X-Conversation-Id", conversationId);
    headers.set("X-Model-Used", modelUsed);
    headers.set("X-Provider-Used", providerUsed);
    headers.set("X-Is-Fallback", isFallback ? "true" : "false");
    headers.set("X-Citations", encodeURIComponent(JSON.stringify(sourceReferences)));

    // Transform stream to also buffer full content for persistent storage in KnowledgeStore
    let fullResponseText = "";
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const transformStream = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        fullResponseText += decoder.decode(chunk, { stream: true });
        // Format as Server-Sent Event data block
        const eventData = `data: ${JSON.stringify({ text: decoder.decode(chunk) })}\n\n`;
        controller.enqueue(encoder.encode(eventData));
      },
      async flush(controller) {
        const latency = Date.now() - startTime;
        // Save the complete assistant message to KnowledgeStore
        KnowledgeStore.addMessage(conversationId, {
          role: "assistant",
          content: fullResponseText,
          source_references: sourceReferences,
          model_identifier: modelUsed,
          latency_ms: latency,
          tokens_used: Math.round(fullResponseText.split(/\s+/).length * 1.3),
        });

        // Resolve AI-generated title for the conversation
        let finalTitle = existingConv?.title;
        if (isInitialTurn) {
          try {
            const resolved = await Promise.race([
              titlePromise,
              new Promise<string>((r) => setTimeout(() => r(""), 2000)),
            ]);
            if (resolved && resolved.trim()) {
              finalTitle = resolved.trim();
              KnowledgeStore.updateConversation(conversationId, { title: finalTitle });
            }
          } catch (e) {
            console.error("Failed to generate title:", e);
          }
        }

        // Send final citations and done event with auto-generated title
        const endEvent = `data: ${JSON.stringify({
          done: true,
          citations: sourceReferences,
          modelUsed,
          latency_ms: latency,
          isFallback,
          title: finalTitle,
          conversationId,
        })}\n\n`;
        controller.enqueue(encoder.encode(endEvent));
      },
    });

    return new Response(stream.pipeThrough(transformStream), { headers });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat message" },
      { status: 500 }
    );
  }
}
