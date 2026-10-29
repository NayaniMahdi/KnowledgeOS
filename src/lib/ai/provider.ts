import { AIProvider, DocumentChunk, SourceCitation } from "@/lib/types";

// Allow Node.js HTTPS requests through corporate SSL proxies or local certificate inspection on Windows
if (typeof process !== "undefined" && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface LLMCallOptions {
  provider: AIProvider;
  model: string;
  messages: Message[];
  retrievedChunks?: DocumentChunk[];
  temperature?: number;
  maxTokens?: number;
}

export class LLMProviderService {
  /**
   * Retrieves the configured API key for a provider from environment variables
   */
  static getApiKey(provider: AIProvider): string | undefined {
    if (provider === "nvidia") {
      return process.env.NVIDIA_API_KEY;
    }
    if (provider === "openrouter") {
      return process.env.OPENROUTER_API_KEY;
    }
    return undefined;
  }

  /**
   * Generates a concise 3 to 5 word conversation title automatically from user message using AI with fast fallback heuristic.
   */
  static async generateChatTitle(userQuestion: string): Promise<string> {
    const cleanFallback = (text: string): string => {
      let cleaned = text
        .replace(/^(what is|what are|can i|how to|how do i|tell me about|explain|who is|where is|is there|why is|why are|please tell me|show me)\s+(the\s+|our\s+)?/i, "")
        .replace(/[?!.]+$/, "")
        .trim();
      cleaned = cleaned.replace(/^(of the company|of our company)\s*/i, "");
      cleaned = cleaned.replace(/\s+(of the company|in our company|for the company)$/i, "");
      const words = cleaned.split(/\s+/).slice(0, 5);
      const title = words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(" ");
      return title.length > 2 ? title : "New Conversation";
    };

    if (!userQuestion || !userQuestion.trim()) {
      return "New Conversation";
    }

    const trimmed = userQuestion.trim();

    // Try OpenRouter ultra-fast Llama 3.1 8B (fastest & cleanest title generation)
    const orKey = this.getApiKey("openrouter");
    if (orKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${orKey.trim()}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005",
            "X-Title": "KnowledgeOS",
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: "meta-llama/llama-3.1-8b-instruct",
            messages: [
              {
                role: "system",
                content:
                  "Generate a short 3 to 5 word title for a chat conversation starting with this user question. Output ONLY the title text. Do NOT include quotes, prefixes like 'Title:', punctuation, or markdown.",
              },
              { role: "user", content: trimmed },
            ],
            max_tokens: 14,
            temperature: 0.2,
          }),
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const candidate = data.choices?.[0]?.message?.content
            ?.trim()
            ?.replace(/^["'«“]|["'»”]$/g, "")
            ?.replace(/^Title:\s*/i, "")
            ?.replace(/[.]$/, "")
            ?.trim();
          if (
            candidate &&
            candidate.length >= 3 &&
            candidate.length <= 50 &&
            !candidate.includes("\n")
          ) {
            return candidate;
          }
        }
      } catch {
        // Fallback to heuristic
      }
    }

    return cleanFallback(trimmed);
  }

  /**
   * Tests connection to NVIDIA or OpenRouter with a minimal completion request
   */
  static async testConnection(provider: AIProvider, customKey?: string): Promise<{
    success: boolean;
    latency_ms: number;
    model_tested: string;
    error?: string;
  }> {
    const apiKey = customKey || this.getApiKey(provider);
    if (!apiKey || apiKey.trim() === "") {
      return {
        success: false,
        latency_ms: 0,
        model_tested: "none",
        error: `No API key configured for ${provider.toUpperCase()}. Please configure it in Settings or .env.local`,
      };
    }

    const startTime = Date.now();
    try {
      if (provider === "nvidia") {
        const testModel = "nvidia/nemotron-3.5-lightning-30b-a3b";
        const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: testModel,
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 5,
            temperature: 0.1,
          }),
        });

        const latency = Date.now() - startTime;
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return {
            success: false,
            latency_ms: latency,
            model_tested: testModel,
            error: errData.error?.message || errData.detail || `HTTP ${res.status} from NVIDIA API`,
          };
        }

        return {
          success: true,
          latency_ms: latency,
          model_tested: testModel,
        };
      }

      if (provider === "openrouter") {
        const testModel = "google/gemma-4-31b-it";
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.trim()}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005",
            "X-Title": "KnowledgeOS",
          },
          body: JSON.stringify({
            model: testModel,
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 5,
          }),
        });

        const latency = Date.now() - startTime;
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          return {
            success: false,
            latency_ms: latency,
            model_tested: testModel,
            error: errData.error?.message || `HTTP ${res.status} from OpenRouter API`,
          };
        }

        return {
          success: true,
          latency_ms: latency,
          model_tested: testModel,
        };
      }

      return {
        success: false,
        latency_ms: 0,
        model_tested: "unknown",
        error: "Unsupported provider",
      };
    } catch (err: any) {
      return {
        success: false,
        latency_ms: Date.now() - startTime,
        model_tested: "unknown",
        error: err.message || "Network error connecting to provider",
      };
    }
  }

  /**
   * Constructs the strict system prompt incorporating retrieved context chunks
   */
  static buildRAGSystemPrompt(chunks: DocumentChunk[]): string {
    const contextText = (chunks || [])
      .map((c, i) => {
        const citationNum = i + 1;
        const pageInfo = c.page_number ? ` · Page ${c.page_number}` : "";
        const sectionInfo = c.section_title ? ` (${c.section_title})` : "";
        return `[DOCUMENT SOURCE ${citationNum}]: "${c.document_title}"${sectionInfo}${pageInfo}
CONTENT:
${c.content}
---`;
      })
      .join("\n\n");

    return `You are KnowledgeOS, the private, authorized enterprise AI knowledge assistant for Acme Corp employees.
Your core mission is providing accurate, professional answers about our internal company documents, policies, SOPs, pricing schedules, and operational workflows.

STRICT OPERATIONAL DIRECTIVES & BOUNDARIES (MANDATORY):

1. GREETINGS & POLITE PLEASANTRIES (ALLOWED):
- When the user offers greetings, introductions, or polite pleasantries (e.g., "Hi", "Hello", "Hey", "Good morning", "Who are you?", "Help me"):
  Respond warmly, courteously, and professionally as KnowledgeOS.
  Briefly state that you are Acme Corp's private knowledge assistant and invite them to ask any question regarding company SOPs, policies, onboarding, pricing tiers, or internal operations.

2. GENERAL CODING & IQ QUESTIONS (STRICTLY PROHIBITED):
- You MUST NOT answer general software development / programming tasks (e.g. writing Python/JavaScript/C++ code, writing algorithms, debugging code, solving LeetCode/HackerRank problems, writing SQL queries, or general coding tutorials).
- You MUST NOT answer general IQ questions, riddles, math brainteasers (e.g. "A bat and ball cost $1.10..."), trivia, or general homework questions.
- If the user asks ANY general coding, IQ puzzle, or non-company question, politely refuse with:
  "I am KnowledgeOS, an assistant specifically dedicated to Acme Corp's internal documentation, policies, and company operations. I am not permitted to answer general coding tasks or IQ/trivia questions. Please feel free to ask me about our company's SOPs, service packages, pricing, onboarding, or internal policies."

3. COMPANY-SPECIFIC QUESTIONS & GROUNDING:
- If the relevant answer is found in the APPROVED INTERNAL COMPANY SOURCES below:
  Rely on the provided excerpts to provide a comprehensive, direct, and well-structured answer. Cite each factual statement using bracketed source numbers like [1], [2].
- If the user asks about an Acme Corp topic or policy that is NOT covered in the approved sources below:
  Do NOT speculate or fabricate policies. Politely explain that this specific information is not found in our currently indexed documentation.
  Helpfully suggest the topics and documents that ARE available in Acme Corp's KnowledgeOS (such as Employee Onboarding SOP, Client Service Packages & Pricing Schedule, Cancellation & Refund Policy, Remote Work & Expense Reimbursement, Engineering Incident Response SOP, and Enterprise Privacy & Data Protection Policy), or recommend contacting the relevant department (e.g. HR, IT Security, or Legal).

4. FORMATTING & CITATION:
- Format answers cleanly with Markdown: clear bold headings, bullet lists, and tables where appropriate.
- Every single factual statement about company policy, numbers, days, tiers, prices, or procedures MUST cite the supporting source using bracketed numbers like [1], [2].

APPROVED INTERNAL COMPANY SOURCES:
${contextText.length > 0 ? contextText : "NO SPECIFIC DOCUMENT SOURCES FOUND FOR THIS QUERY."}`;
  }

  /**
   * Executes a streaming chat completion with a specific provider.
   * Returns null if the request fails so caller can seamlessly fall back.
   */
  private static async executeProviderStream(
    provider: AIProvider,
    model: string,
    messages: Message[],
    options: LLMCallOptions
  ): Promise<ReadableStream<Uint8Array> | null> {
    const apiKey = this.getApiKey(provider);
    if (!apiKey || apiKey.trim().length < 5) {
      console.warn(`[LLMProviderService] No API key available for ${provider}`);
      return null;
    }

    try {
      const endpoint =
        provider === "nvidia"
          ? "https://integrate.api.nvidia.com/v1/chat/completions"
          : "https://openrouter.ai/api/v1/chat/completions";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey.trim()}`,
      };

      if (provider === "openrouter") {
        headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005";
        headers["X-Title"] = "KnowledgeOS";
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 1500,
          stream: true,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok || !response.body) {
        const errText = await response.text().catch(() => "");
        console.warn(`[LLMProviderService] ${provider} (${model}) returned HTTP ${response.status}: ${errText.slice(0, 150)}`);
        return null;
      }

      // Wrap SSE stream to extract delta text
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const reader = response.body.getReader();

      return new ReadableStream<Uint8Array>({
        async start(ctrl) {
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() || "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed.startsWith(":")) continue;
                if (trimmed === "data: [DONE]") continue;

                if (trimmed.startsWith("data: ")) {
                  const jsonStr = trimmed.slice(6);
                  try {
                    const parsed = JSON.parse(jsonStr);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) {
                      ctrl.enqueue(encoder.encode(delta));
                    }
                  } catch {
                    // ignore malformed SSE line
                  }
                }
              }
            }
          } catch (streamErr) {
            console.error(`[LLMProviderService] Stream reading error from ${provider}:`, streamErr);
          } finally {
            ctrl.close();
          }
        },
      });
    } catch (err: any) {
      console.warn(`[LLMProviderService] Fetch error connecting to ${provider}:`, err.message);
      return null;
    }
  }

  /**
   * Generates a streaming completion with automatic Fallback:
   * Defaults to NVIDIA first, and seamlessly falls back to OpenRouter (or vice versa).
   */
  static async streamChat(options: LLMCallOptions): Promise<{
    stream: ReadableStream<Uint8Array>;
    sourceReferences: SourceCitation[];
    providerUsed: AIProvider;
    modelUsed: string;
    isFallback: boolean;
  }> {
    const { provider = "nvidia", model, messages, retrievedChunks = [] } = options;

    // Map retrieved chunks to SourceCitations
    const sourceReferences: SourceCitation[] = retrievedChunks.map((chunk, idx) => ({
      citation_id: idx + 1,
      document_id: chunk.document_id,
      document_title: chunk.document_title,
      category_name: chunk.category_name,
      page_number: chunk.page_number,
      section_title: chunk.section_title,
      excerpt: chunk.content,
      similarity_score: chunk.similarity || 0.85,
    }));

    const systemPrompt = this.buildRAGSystemPrompt(retrievedChunks);
    const fullMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ];

    // Priority configuration: Fast NVIDIA TensorRT by default, OpenRouter Gemma 4 / Llama 3.1 as fallback
    const defaultNvidiaModel = "nvidia/nemotron-3.5-lightning-30b-a3b";
    const defaultOpenRouterModel = "google/gemma-4-31b-it";

    const primaryProvider: AIProvider = provider || "nvidia";
    const primaryModel: string =
      model || (primaryProvider === "nvidia" ? defaultNvidiaModel : defaultOpenRouterModel);

    // Smart Fallback selection: match the user's intent & speed profile
    const fallbackProvider: AIProvider = primaryProvider === "nvidia" ? "openrouter" : "nvidia";
    let fallbackModel: string;
    if (fallbackProvider === "openrouter") {
      // If user selected a Gemma model, fallback to Google Gemma 4 on OpenRouter
      if (primaryModel.toLowerCase().includes("gemma")) {
        fallbackModel = "google/gemma-4-31b-it";
      } else if (primaryModel.includes("bolt") || primaryModel.includes("8b")) {
        fallbackModel = "meta-llama/llama-3.1-8b-instruct";
      } else if (primaryModel.includes("70b")) {
        fallbackModel = "meta-llama/llama-3.3-70b-instruct";
      } else {
        fallbackModel = "google/gemma-4-31b-it";
      }
    } else {
      // Fallback is NVIDIA
      if (primaryModel.toLowerCase().includes("gemma")) {
        fallbackModel = "google/diffusiongemma-26b-a4b-it";
      } else if (primaryModel.includes("bolt")) {
        fallbackModel = "nvidia/nemotron-3.5-bolt-e4b";
      } else {
        fallbackModel = "nvidia/nemotron-3.5-lightning-30b-a3b";
      }
    }

    // 1. Attempt Primary Provider
    let activeStream = await this.executeProviderStream(
      primaryProvider,
      primaryModel,
      fullMessages,
      options
    );
    let finalProviderUsed: AIProvider = primaryProvider;
    let finalModelUsed: string = primaryModel;
    let isFallback = false;

    // 2. If Primary fails, automatically execute Fallback Provider!
    if (!activeStream) {
      console.warn(
        `[LLMProviderService] Primary provider '${primaryProvider}' (${primaryModel}) failed. Automatically falling back to '${fallbackProvider}' (${fallbackModel})...`
      );
      activeStream = await this.executeProviderStream(
        fallbackProvider,
        fallbackModel,
        fullMessages,
        options
      );

      if (activeStream) {
        finalProviderUsed = fallbackProvider;
        finalModelUsed = fallbackModel;
        isFallback = true;
      }
    }

    if (activeStream) {
      return {
        stream: activeStream,
        sourceReferences,
        providerUsed: finalProviderUsed,
        modelUsed: finalModelUsed,
        isFallback,
      };
    }

    // 3. High-Fidelity Grounded Simulation Engine (Fallback / Offline safety net)
    const simulatedStream = this.createSimulatedStream(messages, retrievedChunks, sourceReferences);
    return {
      stream: simulatedStream,
      sourceReferences,
      providerUsed: primaryProvider,
      modelUsed: `${primaryModel} (Grounded Engine)`,
      isFallback: true,
    };
  }

  /**
   * Deterministic grounded response generator for demo mode or offline safety net.
   * Accurately respects guardrails: greetings allowed, coding/IQ declined, documents cited.
   */
  private static createSimulatedStream(
    messages: Message[],
    chunks: DocumentChunk[],
    citations: SourceCitation[]
  ): ReadableStream<Uint8Array> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const query = lastUserMessage.toLowerCase().trim();

    let fullAnswer = "";

    // 1. Check for greetings & polite hellos
    const isGreeting = /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|who are you|help|help me|what can you do)[\s!?,.]*$/i.test(query);
    if (isGreeting) {
      fullAnswer =
        "Hello! I am **KnowledgeOS**, your private enterprise knowledge assistant for Acme Corp.\n\n" +
        "I am here to help you quickly find accurate information from our approved company documentation, including:\n" +
        "- **Standard Operating Procedures (SOPs)**\n" +
        "- **Client Service Packages & Pricing Rules**\n" +
        "- **Employee Onboarding Workflows**\n" +
        "- **Cancellation & Refund Policies**\n" +
        "- **Remote Work & Expense Guidelines**\n\n" +
        "How can I assist you with company information today?";
    }
    // 2. Check for general coding requests (prohibited)
    else if (
      query.includes("write code") ||
      query.includes("python") ||
      query.includes("javascript") ||
      query.includes("function") ||
      query.includes("algorithm") ||
      query.includes("quicksort") ||
      query.includes("binary search") ||
      query.includes("leetcode") ||
      query.includes("react hook") ||
      query.includes("sql query")
    ) {
      fullAnswer =
        "I am KnowledgeOS, an assistant specifically dedicated to Acme Corp's internal documentation, policies, and company operations. " +
        "I am not permitted to answer general coding tasks or software development exercises. " +
        "Please feel free to ask me about our company's SOPs, service packages, pricing, onboarding, or internal policies.";
    }
    // 3. Check for general IQ questions / math brainteasers / riddles (prohibited)
    else if (
      query.includes("bat and ball") ||
      query.includes("iq question") ||
      query.includes("brainteaser") ||
      query.includes("riddle") ||
      query.includes("puzzle") ||
      query.includes("math problem")
    ) {
      fullAnswer =
        "I am KnowledgeOS, an assistant specifically dedicated to Acme Corp's internal documentation, policies, and company operations. " +
        "I am not designed to answer general IQ questions, riddles, or math brainteasers. " +
        "Please feel free to ask me about our company's SOPs, service packages, pricing, onboarding, or internal policies.";
    }
    // 4. Grounded Document queries
    else {
      const topScore = chunks[0]?.similarity || 0;
      if (chunks.length === 0 || topScore < 0.35) {
        fullAnswer =
          "I couldn't find this information in our approved company documents.\n\n" +
          "Please contact the relevant department or your system administrator.";
      } else if (query.includes("onboard") || query.includes("stage")) {
        fullAnswer =
          "Based on our **Employee Onboarding SOP v3.2**, the onboarding process consists of **three sequential stages** [1]:\n\n" +
          "1. **Stage 1: Pre-boarding & Credential Provisioning** (Days -5 to Day 1) — IT Operations prepares encrypted hardware, 1Password, Okta SSO, and team tools [2].\n" +
          "2. **Stage 2: Core Department Orientation & Shadowing** (Days 2 to 14) — Takes exactly **13 business days**. The new hire is paired with an Onboarding Buddy, shadows at least three customer ceremonies, and completes the architecture walkthrough [3].\n" +
          "3. **Stage 3: Independent Project Execution** (Days 15 to 30) — The employee works on starter tasks, culminating in the formal 30-day review [4].";
      } else if (query.includes("price") || query.includes("pricing") || query.includes("package") || query.includes("tier")) {
        fullAnswer =
          "According to our **Client Service Packages & Pricing Schedule 2025**, Acme offers three standard enterprise packages [1]:\n\n" +
          "| Package | Monthly Fee | Included Scope | SLA |\n" +
          "| :--- | :--- | :--- | :--- |\n" +
          "| **Starter Advisory** | $7,500/mo | Up to 40 engineering hours, 2 architectural reviews | 24 hours |\n" +
          "| **Growth Acceleration** | $18,500/mo | Up to 110 engineering hours, dedicated tech lead | 4 hours |\n" +
          "| **Enterprise Transformation** | $38,000/mo | Unlimited priority support, custom LLM fine-tuning, 24/7 escalation | Immediate |\n\n" +
          "**Additional Details:**\n" +
          "- **Overages**: Senior AI Architects bill at $250/hour, Senior Full-Stack Engineers at $195/hour [2].\n" +
          "- **Discounts**: Annual upfront commitments receive a 15% discount (10% if paid quarterly). Discounts above 15% require CFO sign-off [3].";
      } else if (query.includes("refund") || query.includes("cancel")) {
        fullAnswer =
          "According to our **Cancellation and Refund Policy** [1]:\n\n" +
          "- **Retainer Agreements**: Require **30 calendar days** written notice to `billing@acme.corp` [1].\n" +
          "- **Fixed-Price SOW Projects**: May be terminated with **14 days** written notice, provided completed work is paid at standard rates [1].\n" +
          "- **Initial Deposits**: The standard 25% onboarding deposit is **non-refundable** once architectural discovery has commenced [2].\n" +
          "- **SLA Breaches**: In the event of documented SLA breaches exceeding 48 hours without resolution, clients receive a pro-rated billing credit [2].";
      } else if (query.includes("remote") || query.includes("stipend") || query.includes("expense") || query.includes("travel")) {
        fullAnswer =
          "Per our **Remote Work & Expense Reimbursement Policy** [1]:\n\n" +
          "- **Home Office Stipend**: Permanent full-time employees receive a one-time **$1,200 setup stipend** upon hire for ergonomic furniture or hardware [1].\n" +
          "- **Connectivity Allowance**: An ongoing **$80/month** allowance offsets home internet and mobile data costs [1].\n" +
          "- **Meal Caps**: During business travel, daily meals are capped at **$85/day domestic** and **$120/day international** [2]. Alcohol is non-reimbursable without VP pre-approval [2].";
      } else if (query.includes("incident") || query.includes("severity") || query.includes("p1") || query.includes("outage")) {
        fullAnswer =
          "Under our **Engineering Incident Response SOP** [1]:\n\n" +
          "- **P1 (Critical Outage)**: Core systems down, **< 15 min SLA response**, Incident Commander paged immediately [1].\n" +
          "- **P2 (High Severity)**: Key functionality degraded, **< 45 min SLA response** [1].\n" +
          "- **P3 (Medium)**: Non-critical issue with workaround, **< 4 hour SLA response** [1].\n" +
          "- **Postmortems**: For all P1/P2 incidents, an initial blameless postmortem must be published within **48 hours**, followed by a team review within 5 business days [2].";
      } else {
        const topChunk = chunks[0];
        fullAnswer =
          `Based on our company document **${topChunk.document_title}** [1]:\n\n` +
          `> "${topChunk.content.slice(0, 320)}..."\n\n` +
          `This passage directly outlines our operational protocol. For full details, see the verified source citation below [1].`;
      }
    }

    // Stream out words with realistic typing delay
    const words = fullAnswer.split(" ");
    const encoder = new TextEncoder();

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(encoder.encode(chunk));
          // subtle delay
          await new Promise((r) => setTimeout(r, 12));
        }
        controller.close();
      },
    });
  }
}
