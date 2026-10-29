import { AIModelOption } from "@/lib/types";

export const SUPPORTED_MODELS: AIModelOption[] = [
  // Fast & Free NVIDIA Models (TensorRT Accelerated)
  {
    id: "nvidia/nemotron-3.5-bolt-e4b",
    name: "NVIDIA Nemotron 3.5 Bolt (Ultra Fast)",
    provider: "nvidia",
    is_free: true,
    context_length: 65536,
    description: "Blazing fast ~380ms speed optimized for instantaneous document answers and queries.",
  },
  {
    id: "nvidia/nemotron-3.5-lightning-30b-a3b",
    name: "NVIDIA Nemotron 3.5 Lightning (30B)",
    provider: "nvidia",
    is_free: true,
    context_length: 131072,
    description: "Deep reasoning conversational model on NVIDIA TensorRT cloud engines.",
  },
  {
    id: "google/diffusiongemma-26b-a4b-it",
    name: "NVIDIA DiffusionGemma 26B",
    provider: "nvidia",
    is_free: true,
    context_length: 65536,
    description: "Google's Gemma architecture hosted on NVIDIA accelerated infrastructure.",
  },

  // Google Gemma 4 & Fast OpenRouter Models
  {
    id: "google/gemma-4-31b-it",
    name: "Google Gemma 4 (31B IT)",
    provider: "openrouter",
    is_free: false,
    context_length: 131072,
    description: "Google's newest flagship Gemma 4 model: outstanding reasoning, policy adherence, and fast response.",
  },
  {
    id: "google/gemma-4-26b-a4b-it",
    name: "Google Gemma 4 (26B A4B MoE)",
    provider: "openrouter",
    is_free: false,
    context_length: 131072,
    description: "Next-gen MoE Gemma 4 variant delivering sub-second response times and sharp precision.",
  },
  {
    id: "google/gemma-3-27b-it",
    name: "Google Gemma 3 (27B IT)",
    provider: "openrouter",
    is_free: false,
    context_length: 32768,
    description: "High-capability Gemma 3 instruction model optimized for structured knowledge workflows.",
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B Instruct",
    provider: "openrouter",
    is_free: false,
    context_length: 131072,
    description: "Instantaneous ~150ms response time with excellent document comprehension.",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    provider: "openrouter",
    is_free: false,
    context_length: 131072,
    description: "Meta's flagship 70B model for complex enterprise analysis and deep syntheses.",
  },
];
