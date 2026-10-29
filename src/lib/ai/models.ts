import { AIModelOption } from "@/lib/types";

export const SUPPORTED_MODELS: AIModelOption[] = [
  // OpenRouter Models
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash (Free)",
    provider: "openrouter",
    is_free: true,
    context_length: 1048576,
    description: "Ultra-fast multimodal model with 1M context, free tier available on OpenRouter.",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B Instruct (Free)",
    provider: "openrouter",
    is_free: true,
    context_length: 131072,
    description: "Meta's flagship open-weights model, free community access on OpenRouter.",
  },
  {
    id: "deepseek/deepseek-r1:free",
    name: "DeepSeek R1 Reasoning (Free)",
    provider: "openrouter",
    is_free: true,
    context_length: 65536,
    description: "High-level reasoning model with step-by-step thinking traces.",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "openrouter",
    is_free: false,
    context_length: 200000,
    description: "Industry-leading intelligence, coding, and document analysis.",
  },
  {
    id: "qwen/qwen-2.5-72b-instruct",
    name: "Qwen 2.5 72B Instruct",
    provider: "openrouter",
    is_free: false,
    context_length: 131072,
    description: "High-capability multilingual model competitive with frontier models.",
  },

  // NVIDIA Hosted Models (via build.nvidia.com)
  {
    id: "meta/llama-3.3-70b-instruct",
    name: "NVIDIA Llama 3.3 70B Instruct",
    provider: "nvidia",
    is_free: true, // NVIDIA gives free trial API credits on build.nvidia.com
    context_length: 131072,
    description: "Hosted with NVIDIA TensorRT-LLM acceleration for ultra-low latency.",
  },
  {
    id: "mistralai/mistral-large-2407",
    name: "NVIDIA Mistral Large (2407)",
    provider: "nvidia",
    is_free: false,
    context_length: 128000,
    description: "Top-tier enterprise reasoning and instruction following hosted by NVIDIA.",
  },
  {
    id: "nvidia/llama-3.1-nemotron-70b-instruct",
    name: "NVIDIA Nemotron 70B",
    provider: "nvidia",
    is_free: true,
    context_length: 131072,
    description: "NVIDIA-customized alignment model optimized for enterprise chatbots.",
  },
  {
    id: "deepseek-ai/deepseek-r1",
    name: "NVIDIA DeepSeek R1",
    provider: "nvidia",
    is_free: true,
    context_length: 65536,
    description: "DeepSeek R1 reasoning accelerated on NVIDIA HGX infrastructure.",
  },
];
