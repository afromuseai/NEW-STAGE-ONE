# STAGEONE

STAGEONE is an AI Business Operating System that transforms any business idea into a complete strategic blueprint — industry analysis, growth plans, competitive insights, and tech stack recommendations.

## Run & Operate

- `pnpm --filter @workspace/stageone run dev` — run the frontend (port 22923)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- Required env: `NVIDIA_API_KEY` — for AI business intelligence generation via NVIDIA NIM API

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React 19, Tailwind CSS v4, wouter routing, framer-motion
- API: Express 5, streamed SSE responses
- AI: NVIDIA NIM API (meta/llama-3.1-70b-instruct) via streaming
- Build: esbuild (API), Vite (frontend)

## Where things live

- `artifacts/stageone/` — React frontend (landing, login, signup, dashboard, settings pages)
- `artifacts/stageone/src/pages/` — route pages (landing, dashboard, login, signup, settings, not-found)
- `artifacts/stageone/src/components/dashboard/` — dashboard UI: input panel, output panel, sidebar, header
- `artifacts/stageone/src/components/landing/` — landing page sections: hero, features, how-it-works, CTA
- `artifacts/stageone/src/lib/auth-context.tsx` — client-side auth (localStorage-based for demo)
- `artifacts/api-server/src/routes/generate.ts` — POST /api/generate — NVIDIA streaming endpoint
- `artifacts/api-server/src/routes/health.ts` — GET /api/healthz

## Architecture decisions

- All routing is client-side via wouter (no SSR). The app was ported from Next.js to Vite + React.
- Auth is localStorage-based (demo quality) — suitable for single-device use; not production-secure.
- AI responses are streamed via SSE from the API server, forwarded from NVIDIA's SSE API.
- Projects are saved in localStorage with cached AI results to avoid re-generation on revisit.
- The API server uses esbuild to bundle to a single ESM file for fast startup.

## Product

- Landing page with features, how-it-works, and CTA
- Login / Signup with localStorage-based auth
- Dashboard: enter a business idea, get streaming AI analysis with metrics, strategic insights, competitive advantage, growth plan, website pages, automations, and recommended tech stack
- Project sidebar: save and revisit up to 20 past analyses with cached results
- Settings page: profile, preferences, data management, API status

## Gotchas

- `NVIDIA_API_KEY` must be set as a secret for the generate endpoint to work
- The frontend proxies `/api` requests to the API server via the Vite dev proxy (localhost:8080)
- Do NOT run `pnpm dev` at workspace root — use `restart_workflow` or filter commands instead
- stageone artifact requires `index.html` at the artifact root (not inside `src/`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
