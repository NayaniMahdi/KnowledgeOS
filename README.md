# KnowledgeOS — Private Company Knowledge Assistant

KnowledgeOS is a private, retrieval-augmented generation (RAG) knowledge assistant for business enterprises. It enables authorized employees to securely query approved company documentation—including Standard Operating Procedures (SOPs), service contracts, pricing tiers, refund policies, FAQs, and engineering guidelines.

The user experience combines the simplicity of ChatGPT with the refined, minimalist aesthetics of an Apple-designed productivity tool.

---

## 1. Architecture Overview

KnowledgeOS is designed around Vercel's serverless runtime, PostgreSQL with `pgvector`, and direct integration with leading frontier AI providers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                                Frontend                                │
│       Next.js 15 (App Router) + React 19 + Tailwind CSS + Lucide        │
│       System / Light / Dark Themes • Apple-inspired Semantic Tokens    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                       HTTP / Server-Sent Events
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                             Route Handlers                             │
│       /api/chat • /api/documents • /api/search • /api/settings         │
└─────────┬─────────────────────────┬──────────────────────────┬─────────┘
          │                         │                          │
┌─────────▼───────────┐   ┌─────────▼───────────┐   ┌──────────▼─────────┐
│ Document Ingestion  │   │   Intelligent RAG   │   │   Model Providers  │
│ • PDF (pdf-parse)   │   │ • Permission Filter │   │ • NVIDIA API       │
│ • DOCX (mammoth)    │   │ • Hybrid Search     │   │ • OpenRouter API   │
│ • CSV (papaparse)   │   │ • Strict Grounding  │   │ • Free Models      │
│ • TXT / Markdown    │   │ • Numbered Citations│   │ • Stream SSE       │
│ • Overlap Chunker   │   │ • Anti-Hallucination│   │ • Test Connection  │
└─────────────────────┘   └─────────────────────┘   └────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                          Database & Storage                            │
│           PostgreSQL with pgvector (Supabase) + RLS Policies           │
│        + In-Memory Isolated Demo Knowledge Store for instant demo      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Verified Core Features

### 1. Intelligent Chat & Grounded RAG
- **RAG-Driven Responses**: Queries are augmented with authorized document passages retrieved via semantic cosine + keyword hybrid ranking.
- **Strict Grounding & Missing Information Detection**: System instructions forbid fabricating policies, prices, or procedures. If relevant documents do not exist, the assistant acknowledges the gap.
- **Streaming Tokens**: Server-Sent Events (SSE) deliver real-time token streaming with cancel/stop generation support.
- **Numbered Citations**: Factual statements feature interactive `[1]`, `[2]` citation pills. Clicking any citation opens the Apple-styled **Citation Inspector** modal displaying document name, category, exact location (page/section), confidence score, and verified excerpt.

### 2. Real LLM Providers (NVIDIA & OpenRouter)
- **NVIDIA Integration**: Official endpoints at `https://integrate.api.nvidia.com/v1/chat/completions` supporting `meta/llama-3.3-70b-instruct`, `mistralai/mistral-large-2407`, `nvidia/llama-3.1-nemotron-70b-instruct`, and `deepseek-ai/deepseek-r1`.
- **OpenRouter Integration**: Official endpoints at `https://openrouter.ai/api/v1/chat/completions` supporting free models (`google/gemini-2.0-flash-exp:free`, `meta-llama/llama-3.3-70b-instruct:free`, `deepseek/deepseek-r1:free`) and frontier models (`anthropic/claude-3.5-sonnet`, `qwen/qwen-2.5-72b-instruct`).
- **Connection Testing Tool**: Real ping endpoint (`/api/settings/test-connection`) verifies API credentials and reports latency without exposing secrets to the browser.
- **High-Fidelity Grounded Fallback**: Operates out of the box even before external API keys are entered.

### 3. Knowledge Base & Document Pipeline
- **Multi-Format Parsing**:
  - `.pdf`: Extracts text and page markers using `pdf-parse`.
  - `.docx`: Extracts structured text using `mammoth`.
  - `.csv`: Tabular normalization using `papaparse`.
  - `.txt` & `.md`: Clean UTF-8 extraction with header preservation.
- **Chunking Engine**: Configurable chunk size (800 chars) with overlap (150 chars) to prevent context fragmentation at sentence boundaries.
- **Chunk Inspector Drawer**: Administrators can review the exact extracted passages for any document.
- **Document Management**: Drag-and-drop uploader, metadata editing, document reprocessing, and deletion with automatic chunk purging.

### 4. Role-Based Access Control (RBAC) & Tenant Isolation
- **Roles**:
  - **Administrator** (`Sarah Chen`): Can manage users, upload documents, delete documents, and access confidential executive records.
  - **Employee** (`Alex Rivera`): Accesses approved company documents within their department; restricted from administrator-only confidential directives.
- **One-Click Role Switcher**: Located in the sidebar and header to easily demonstrate access boundary enforcement.

### 5. Demo Mode Toggle
- **Demo Mode: ON**: Seeds realistic sample documents (Employee Onboarding SOP, Client Pricing Schedule, Refund Policy, Remote Work Expenses, Incident Response SOP).
- **Demo Mode: OFF**: Strictly queries production database records without mock data.

### 6. Apple-Inspired Design System
- Semantic color tokens for System, Light, and Dark modes.
- Light Palette: `#FAFAF8` (background), `#FFFFFF` (surface), `#202124` (text), `#365C49` (accent).
- Dark Palette: `#171816` (background), `#20211F` (surface), `#F3F3EF` (text), `#9BB8A4` (accent).
- Precision logo combining architectural document folios with an intelligence focus aperture.

---

## 3. Environment Variables Reference

Create a `.env.local` file based on `.env.example`:

| Variable | Description | Where to Obtain |
| :--- | :--- | :--- |
| `NVIDIA_API_KEY` | NVIDIA Build API Key for hosted Llama, Nemotron, Mistral | [build.nvidia.com](https://build.nvidia.com/) |
| `OPENROUTER_API_KEY` | OpenRouter API Key for free and frontier models | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `DEFAULT_AI_PROVIDER` | Default active provider (`nvidia` or `openrouter`) | Default: `openrouter` |
| `DEFAULT_AI_MODEL` | Default model identifier | e.g. `google/gemini-2.0-flash-exp:free` |
| `DATABASE_URL` | PostgreSQL connection string with `pgvector` enabled | [supabase.com](https://supabase.com/) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project API URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous public key | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role secret key | Supabase Dashboard > Settings > API |
| `AUTH_SECRET` | 32-character secret key for signing session tokens | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Base public URL | `http://localhost:3000` |
| `NEXT_PUBLIC_DEFAULT_DEMO_MODE`| Enable demo mode out of the box | `true` |

---

## 4. Local Development Setup

1. **Clone & Install Dependencies**:
   ```bash
   git clone <repository-url>
   cd Project2A
   npm install
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   *(Optional: Add your `OPENROUTER_API_KEY` or `NVIDIA_API_KEY` to `.env.local` to use live models immediately.)*

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Database Setup (Supabase & PostgreSQL)

If connecting a live Supabase PostgreSQL database:

1. Create a project at [supabase.com](https://supabase.com/).
2. Navigate to **SQL Editor** in the Supabase dashboard.
3. Run the schema script located at:
   `supabase/migrations/20250101000000_knowledgeos_schema.sql`
4. Run the seed data script:
   `supabase/seed.sql`
5. Copy your project connection strings into `.env.local`.

---

## 6. Deployment Guide

### Deploying to GitHub
```bash
git init
git add .
git commit -m "feat: initial commit for KnowledgeOS enterprise assistant"
git branch -M main
git remote add origin https://github.com/<your-username>/knowledgeos.git
git push -u origin main
```

### Deploying to Vercel
1. Import your GitHub repository into [Vercel](https://vercel.com/new).
2. Set the framework preset to **Next.js**.
3. In the **Environment Variables** section, configure:
   - `OPENROUTER_API_KEY` and/or `NVIDIA_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel deployment URL)
   - `DATABASE_URL` (your Supabase PostgreSQL URL)
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `AUTH_SECRET`
4. Click **Deploy**. Vercel will build and launch your production environment.

---

## 7. Verification & Test Report

| Test Suite | Test Case | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **Grounding** | Query answered by SOP | Returns factual response with `[1]`, `[2]` citations | **PASSED** |
| **Missing Info**| Query not in company docs | Returns explicit missing information disclaimer | **PASSED** |
| **Citations** | Clicking citation pill | Opens Citation Inspector with exact excerpt and page | **PASSED** |
| **Ingestion** | Document upload (PDF, TXT, DOCX, CSV) | Parses text, generates chunks, indexes immediately | **PASSED** |
| **Chunk Purge**| Document deletion | Purges document and removes chunks from search | **PASSED** |
| **Access Control** | Employee queries Admin-only document | Restricted chunks are filtered out from results | **PASSED** |
| **AI Providers** | Connection test to provider API | Returns status, latency in ms, model tested | **PASSED** |
| **Theme System**| System / Light / Dark toggle | Updates semantic tokens and respects OS preference | **PASSED** |
| **Build & Types**| Next.js production build (`npm run build`) | Zero TypeScript or compilation errors | **PASSED** |
