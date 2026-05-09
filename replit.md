# STAGEONE

STAGEONE is an AI Business Operating System that transforms any business idea into a complete strategic blueprint AND a fully-generated, launch-ready website — industry analysis, growth plans, competitive insights, tech stack recommendations, live website preview, and exportable React code.

## Run & Operate

- `pnpm --filter @workspace/stageone run dev` — run the frontend (port 22923)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `NVIDIA_API_KEY` — for AI generation via NVIDIA NIM API
- Required env: `DATABASE_URL` — PostgreSQL connection string
- Optional env: `JWT_SECRET` — JWT signing secret (defaults to dev string; set in production)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 19, Tailwind CSS v4, wouter routing, framer-motion, JSZip
- API: Express 5, streamed SSE responses, cookie-parser, bcryptjs, jsonwebtoken
- AI: NVIDIA NIM API (meta/llama-3.1-70b-instruct) via streaming
- DB: PostgreSQL + Drizzle ORM (`lib/db/` workspace)
- Auth: JWT cookies (7-day sessions), bcryptjs password hashing
- Build: esbuild (API), Vite (frontend)

## Where things live

- `artifacts/stageone/src/pages/` — route pages (landing, dashboard, login, signup, settings, project, not-found)
- `artifacts/stageone/src/components/dashboard/` — dashboard UI: input panel, output panel, sidebar, website panel
- `artifacts/stageone/src/components/landing/` — landing page sections: hero, features, how-it-works, CTA
- `artifacts/stageone/src/lib/auth-context.tsx` — real JWT-based auth context (API-backed)
- `artifacts/stageone/src/lib/api.ts` — typed API client (auth + projects CRUD)
- `artifacts/stageone/src/lib/website-html-generator.ts` — pure function that builds a self-contained HTML preview from WebsiteOutput data + Next.js project builder for export
- `artifacts/api-server/src/routes/generate.ts` — POST /api/generate — business intelligence streaming
- `artifacts/api-server/src/routes/generate-website.ts` — POST /api/generate/website — website structure streaming (8 sections, React code, colors, typography)
- `artifacts/api-server/src/routes/auth.ts` — POST /api/auth/signup|login|logout, GET /api/auth/me
- `artifacts/api-server/src/routes/projects.ts` — full projects CRUD (JWT-protected)
- `artifacts/api-server/src/middleware/auth.ts` — JWT cookie middleware
- `lib/db/src/schema/` — Drizzle schema: users, projects (with websiteOutput JSONB column)

## Architecture decisions

- All routing is client-side via wouter (no SSR)
- Auth: real JWT cookies (7-day), bcryptjs hashing — NOT localStorage anymore
- AI responses streamed via SSE from the API server, forwarded from NVIDIA's SSE API
- Website preview HTML is generated CLIENT-SIDE from structured AI output (reliable, editable, fast)
- Preview uses inline CSS + Google Fonts CDN (no Tailwind CDN needed in iframe — most reliable approach)
- ZIP export uses JSZip to create a complete Next.js 14 project structure in the browser
- The API server uses esbuild to bundle to a single ESM file for fast startup

## Product Features

### Business Intelligence
- Enter a business idea → streaming AI analysis (metrics, competitive advantage, growth plan, tech stack)
- Auto-saved to PostgreSQL with project CRUD

### AI Website Builder (NEW)
- "Generate Website" button after business analysis completes
- AI generates complete website package: 8 sections (nav/hero/features/testimonials/pricing/CTA/FAQ/footer), color palette, typography, brand voice, design system, React + Tailwind components
- **Live Preview**: split-view panel with a real browser-chrome-styled iframe preview
- **Desktop/Mobile toggle**: switches iframe width (full-width vs 390px mobile)
- **Editable sections**: click any field in the Sections tab to edit text inline; preview updates instantly
- **4 tabs**: Design (colors/typography/brand), Sections (editable content), Code (per-component React code), Export
- **Export options**: Copy code, Download standalone HTML, Download Next.js 14 ZIP project (JSZip)
- Website data persisted to project's `websiteOutput` JSONB column

## Gotchas

- `NVIDIA_API_KEY` must be set as a secret for AI endpoints to work
- `DATABASE_URL` must be set (Replit PostgreSQL)
- The frontend proxies `/api` requests to the API server via the Vite dev proxy (localhost:8080)
- Do NOT run `pnpm dev` at workspace root — use `restart_workflow` or filter commands instead
- stageone artifact requires `index.html` at the artifact root (not inside `src/`)
- Website panel uses `overflow-hidden` + flex height chain for proper split-view layout — don't add `overflow-y-auto` on parent containers when website tab is active

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
