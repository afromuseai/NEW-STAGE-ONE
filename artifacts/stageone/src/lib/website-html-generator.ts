export interface WebsiteOutput {
  colorPalette: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    headingStyle?: string
    bodySize?: string
  }
  brand: {
    name: string
    tagline: string
    voice: string
  }
  design: {
    style: string
    uiDirection: string
    animations: string[]
    borderRadius: string
    glassmorphism: boolean
  }
  sections: {
    nav: { logo: string; links: string[] }
    hero: {
      badge: string
      headline: string
      subheadline: string
      ctaPrimary: string
      ctaSecondary: string
      socialProof: string
    }
    features: {
      title: string
      subtitle: string
      items: Array<{ icon: string; title: string; description: string }>
    }
    testimonials: {
      title: string
      items: Array<{ quote: string; author: string; role: string; company: string }>
    }
    pricing: {
      title: string
      subtitle: string
      tiers: Array<{
        name: string
        price: string
        period: string
        description: string
        features: string[]
        cta: string
        highlighted: boolean
        badge: string | null
      }>
    }
    cta: { headline: string; subheadline: string; buttonText: string }
    faq: { title: string; items: Array<{ question: string; answer: string }> }
    footer: {
      tagline: string
      columns: Array<{ title: string; links: string[] }>
      legal: string
    }
  }
  seoMeta: { title: string; description: string; keywords: string[] }
  componentCode: Record<string, string>
}

function esc(s: string): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function encodeFont(f: string): string {
  return (f ?? "Inter").replace(/ /g, "+") + ":wght@400;500;600;700;800"
}

function iconSvg(name: string, color: string): string {
  const icons: Record<string, string> = {
    Zap: `<svg width="24" height="24" fill="none" stroke="${color}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    Target: `<svg width="24" height="24" fill="none" stroke="${color}" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    Shield: `<svg width="24" height="24" fill="none" stroke="${color}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    Rocket: `<svg width="24" height="24" fill="none" stroke="${color}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 11l-4 4 1 4 4-1 4-4M15 9l-2.5-2.5M3 21l3-3M13 4l7 7-9 9-7-7z"/></svg>`,
    Globe: `<svg width="24" height="24" fill="none" stroke="${color}" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>`,
    Sparkles: `<svg width="24" height="24" fill="none" stroke="${color}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.7.7m14.14 14.14.7.7M3 12H2m20 0h-1M4.22 19.78l.7-.7M19.07 4.93l.7-.7M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>`,
    BarChart: `<svg width="24" height="24" fill="none" stroke="${color}" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="6" width="4" height="15"/><rect x="17" y="3" width="4" height="18"/></svg>`,
    Check: `<svg width="16" height="16" fill="none" stroke="${color}" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
    Star: `<svg width="24" height="24" fill="${color}" stroke="${color}" stroke-width="1" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  }
  return icons[name] ?? icons["Sparkles"]
}

function buildNavHtml(nav: WebsiteOutput["sections"]["nav"], c: WebsiteOutput["colorPalette"], brand: WebsiteOutput["brand"]): string {
  const links = (nav?.links ?? ["Features", "Pricing", "FAQ"]).map(l =>
    `<a href="#" style="color:${c.textMuted};font-size:14px;font-weight:500;text-decoration:none;transition:color .2s" onmouseover="this.style.color='${c.text}'" onmouseout="this.style.color='${c.textMuted}'">${esc(l)}</a>`
  ).join("")
  return `
<nav style="position:sticky;top:0;z-index:50;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:${c.background}CC;border-bottom:1px solid ${c.border};padding:0 24px">
  <div style="max-width:1200px;margin:0 auto;height:64px;display:flex;align-items:center;justify-content:space-between">
    <div style="font-family:inherit;font-size:20px;font-weight:800;color:${c.text};letter-spacing:-0.5px">${esc(nav?.logo ?? brand.name)}</div>
    <div style="display:flex;gap:32px;align-items:center">${links}</div>
    <button style="background:${c.primary};color:${c.background};padding:8px 20px;border-radius:8px;border:none;font-weight:600;font-size:14px;cursor:pointer">Get Started</button>
  </div>
</nav>`
}

function buildHeroHtml(hero: WebsiteOutput["sections"]["hero"], c: WebsiteOutput["colorPalette"]): string {
  return `
<section style="padding:120px 24px 100px;text-align:center;background:radial-gradient(ellipse at 50% 0%, ${c.primary}18 0%, transparent 70%),${c.background}">
  <div style="max-width:800px;margin:0 auto">
    ${hero?.badge ? `<div style="display:inline-block;padding:6px 16px;border-radius:100px;border:1px solid ${c.primary}40;background:${c.primary}15;color:${c.primary};font-size:13px;font-weight:600;margin-bottom:28px;letter-spacing:.5px">${esc(hero.badge)}</div>` : ""}
    <h1 style="font-size:clamp(40px,6vw,72px);font-weight:800;line-height:1.1;color:${c.text};margin:0 0 24px;letter-spacing:-2px">${esc(hero?.headline ?? "")}</h1>
    <p style="font-size:18px;line-height:1.7;color:${c.textMuted};max-width:600px;margin:0 auto 40px">${esc(hero?.subheadline ?? "")}</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
      <button style="padding:16px 36px;border-radius:12px;background:${c.primary};color:${c.background};font-weight:700;font-size:16px;border:none;cursor:pointer;box-shadow:0 0 40px ${c.primary}40">${esc(hero?.ctaPrimary ?? "Get Started")}</button>
      <button style="padding:16px 36px;border-radius:12px;background:transparent;color:${c.text};font-weight:600;font-size:16px;border:1px solid ${c.border};cursor:pointer">${esc(hero?.ctaSecondary ?? "Learn More")}</button>
    </div>
    ${hero?.socialProof ? `<p style="margin-top:28px;font-size:13px;color:${c.textMuted}">${esc(hero.socialProof)}</p>` : ""}
  </div>
</section>`
}

function buildFeaturesHtml(features: WebsiteOutput["sections"]["features"], c: WebsiteOutput["colorPalette"]): string {
  const items = (features?.items ?? []).map(f => `
  <div style="padding:24px;border-radius:16px;background:${c.surface};border:1px solid ${c.border};transition:border-color .2s" onmouseover="this.style.borderColor='${c.primary}40'" onmouseout="this.style.borderColor='${c.border}'">
    <div style="width:44px;height:44px;border-radius:10px;background:${c.primary}15;border:1px solid ${c.primary}30;display:flex;align-items:center;justify-content:center;margin-bottom:16px">${iconSvg(f.icon, c.primary)}</div>
    <h3 style="font-size:16px;font-weight:700;color:${c.text};margin:0 0 8px">${esc(f.title)}</h3>
    <p style="font-size:14px;color:${c.textMuted};line-height:1.6;margin:0">${esc(f.description)}</p>
  </div>`).join("")
  return `
<section style="padding:100px 24px;background:${c.background}">
  <div style="max-width:1200px;margin:0 auto">
    <div style="text-align:center;margin-bottom:64px">
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;color:${c.text};margin:0 0 16px;letter-spacing:-1px">${esc(features?.title ?? "Features")}</h2>
      <p style="font-size:17px;color:${c.textMuted};margin:0">${esc(features?.subtitle ?? "")}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px">${items}</div>
  </div>
</section>`
}

function buildTestimonialsHtml(testimonials: WebsiteOutput["sections"]["testimonials"], c: WebsiteOutput["colorPalette"]): string {
  const stars = `<div style="display:flex;gap:3px;margin-bottom:16px">${Array(5).fill(`${iconSvg("Star", c.primary)}`).join("")}</div>`
  const items = (testimonials?.items ?? []).map(t => `
  <div style="padding:28px;border-radius:20px;background:${c.surface};border:1px solid ${c.border}">
    ${stars}
    <p style="font-size:15px;line-height:1.7;color:${c.text};margin:0 0 24px;font-style:italic">"${esc(t.quote)}"</p>
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:40px;height:40px;border-radius:50%;background:${c.primary}30;display:flex;align-items:center;justify-content:center;color:${c.primary};font-weight:700;font-size:16px">${esc(t.author?.[0] ?? "A")}</div>
      <div>
        <p style="font-weight:700;color:${c.text};margin:0;font-size:14px">${esc(t.author)}</p>
        <p style="color:${c.textMuted};margin:0;font-size:13px">${esc(t.role)}, ${esc(t.company)}</p>
      </div>
    </div>
  </div>`).join("")
  return `
<section style="padding:100px 24px;background:${c.background === "#ffffff" ? "#f8f8f8" : "#0a0a0a"}">
  <div style="max-width:1200px;margin:0 auto">
    <h2 style="text-align:center;font-size:clamp(28px,4vw,44px);font-weight:800;color:${c.text};margin:0 0 64px;letter-spacing:-1px">${esc(testimonials?.title ?? "What customers say")}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">${items}</div>
  </div>
</section>`
}

function buildPricingHtml(pricing: WebsiteOutput["sections"]["pricing"], c: WebsiteOutput["colorPalette"]): string {
  const tiers = (pricing?.tiers ?? []).map(t => `
  <div style="padding:36px;border-radius:24px;background:${t.highlighted ? c.primary + "10" : c.surface};border:1.5px solid ${t.highlighted ? c.primary + "50" : c.border};position:relative;display:flex;flex-direction:column;gap:8px">
    ${t.badge ? `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:${c.primary};color:${c.background};padding:4px 16px;border-radius:100px;font-size:12px;font-weight:700;white-space:nowrap">${esc(t.badge)}</div>` : ""}
    <div style="font-size:18px;font-weight:700;color:${c.text}">${esc(t.name)}</div>
    <div style="display:flex;align-items:baseline;gap:4px;margin:8px 0">
      <span style="font-size:48px;font-weight:800;color:${t.highlighted ? c.primary : c.text};line-height:1">${esc(t.price)}</span>
      <span style="color:${c.textMuted};font-size:15px">${esc(t.period)}</span>
    </div>
    ${t.description ? `<p style="font-size:14px;color:${c.textMuted};margin:0 0 16px">${esc(t.description)}</p>` : ""}
    <div style="flex:1">
      ${(t.features ?? []).map(f => `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid ${c.border}30">
        <div style="flex-shrink:0;width:18px;height:18px;border-radius:50%;background:${c.primary}25;display:flex;align-items:center;justify-content:center">${iconSvg("Check", c.primary)}</div>
        <span style="font-size:14px;color:${c.textMuted}">${esc(f)}</span>
      </div>`).join("")}
    </div>
    <button style="margin-top:24px;width:100%;padding:14px;border-radius:12px;border:none;cursor:pointer;font-weight:700;font-size:15px;background:${t.highlighted ? c.primary : "transparent"};color:${t.highlighted ? c.background : c.text};border:1px solid ${t.highlighted ? c.primary : c.border}">${esc(t.cta)}</button>
  </div>`).join("")
  return `
<section style="padding:100px 24px;background:${c.background}">
  <div style="max-width:1200px;margin:0 auto">
    <div style="text-align:center;margin-bottom:64px">
      <h2 style="font-size:clamp(28px,4vw,44px);font-weight:800;color:${c.text};margin:0 0 16px;letter-spacing:-1px">${esc(pricing?.title ?? "Pricing")}</h2>
      <p style="font-size:17px;color:${c.textMuted};margin:0">${esc(pricing?.subtitle ?? "")}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;align-items:start">${tiers}</div>
  </div>
</section>`
}

function buildCtaHtml(cta: WebsiteOutput["sections"]["cta"], c: WebsiteOutput["colorPalette"]): string {
  return `
<section style="padding:100px 24px;background:${c.background}">
  <div style="max-width:800px;margin:0 auto;text-align:center;padding:80px 40px;border-radius:32px;background:radial-gradient(ellipse at 50% 50%, ${c.primary}20 0%, ${c.surface} 70%);border:1px solid ${c.primary}30">
    <h2 style="font-size:clamp(28px,4vw,48px);font-weight:800;color:${c.text};margin:0 0 20px;letter-spacing:-1.5px">${esc(cta?.headline ?? "Ready to get started?")}</h2>
    <p style="font-size:18px;color:${c.textMuted};margin:0 0 40px;line-height:1.6">${esc(cta?.subheadline ?? "")}</p>
    <button style="padding:18px 48px;border-radius:14px;background:${c.primary};color:${c.background};font-weight:700;font-size:17px;border:none;cursor:pointer;box-shadow:0 0 60px ${c.primary}50">${esc(cta?.buttonText ?? "Get Started Free")}</button>
  </div>
</section>`
}

function buildFaqHtml(faq: WebsiteOutput["sections"]["faq"], c: WebsiteOutput["colorPalette"]): string {
  const items = (faq?.items ?? []).map((item, i) => `
  <details style="border-radius:12px;border:1px solid ${c.border};overflow:hidden;cursor:pointer">
    <summary style="padding:20px 24px;font-weight:600;color:${c.text};font-size:16px;list-style:none;display:flex;justify-content:space-between;align-items:center;background:${c.surface}">
      ${esc(item.question)}
      <span style="color:${c.primary};flex-shrink:0;margin-left:16px">+</span>
    </summary>
    <div style="padding:20px 24px;background:${c.background};color:${c.textMuted};font-size:15px;line-height:1.7;border-top:1px solid ${c.border}">${esc(item.answer)}</div>
  </details>`).join("")
  return `
<section style="padding:100px 24px;background:${c.background === "#ffffff" ? "#f8f8f8" : "#0a0a0a"}">
  <div style="max-width:720px;margin:0 auto">
    <h2 style="text-align:center;font-size:clamp(28px,4vw,44px);font-weight:800;color:${c.text};margin:0 0 48px;letter-spacing:-1px">${esc(faq?.title ?? "Frequently Asked Questions")}</h2>
    <div style="display:flex;flex-direction:column;gap:12px">${items}</div>
  </div>
</section>`
}

function buildFooterHtml(footer: WebsiteOutput["sections"]["footer"], brand: WebsiteOutput["brand"], c: WebsiteOutput["colorPalette"]): string {
  const cols = (footer?.columns ?? []).map(col => `
  <div>
    <div style="font-weight:700;color:${c.text};margin-bottom:16px;font-size:14px">${esc(col.title)}</div>
    ${(col.links ?? []).map(l => `<a href="#" style="display:block;color:${c.textMuted};font-size:14px;text-decoration:none;margin-bottom:10px;transition:color .2s" onmouseover="this.style.color='${c.text}'" onmouseout="this.style.color='${c.textMuted}'">${esc(l)}</a>`).join("")}
  </div>`).join("")
  return `
<footer style="background:${c.background};border-top:1px solid ${c.border};padding:64px 24px 32px">
  <div style="max-width:1200px;margin:0 auto">
    <div style="display:grid;grid-template-columns:1.5fr repeat(auto-fit,1fr);gap:48px;margin-bottom:48px">
      <div>
        <div style="font-size:20px;font-weight:800;color:${c.text};margin-bottom:12px">${esc(brand?.name ?? "")}</div>
        <p style="color:${c.textMuted};font-size:14px;line-height:1.6;max-width:240px">${esc(footer?.tagline ?? brand?.tagline ?? "")}</p>
      </div>
      ${cols}
    </div>
    <div style="border-top:1px solid ${c.border};padding-top:24px;text-align:center;color:${c.textMuted};font-size:13px">${esc(footer?.legal ?? `© ${new Date().getFullYear()} ${brand?.name ?? ""}. All rights reserved.`)}</div>
  </div>
</footer>`
}

export function buildPreviewHtml(data: WebsiteOutput): string {
  const c = data.colorPalette ?? {
    primary: "#d4af37", secondary: "#1a1a1a", accent: "#d4af37",
    background: "#0a0a0a", surface: "#111111", text: "#ffffff",
    textMuted: "#888888", border: "#222222"
  }
  const t = data.typography ?? { headingFont: "Inter", bodyFont: "Inter" }
  const s = data.sections ?? {} as WebsiteOutput["sections"]
  const brand = data.brand ?? { name: "Brand", tagline: "", voice: "professional" }

  const headingFont = `'${t.headingFont}', system-ui, sans-serif`
  const bodyFont = `'${t.bodyFont}', system-ui, sans-serif`
  const gFonts = `https://fonts.googleapis.com/css2?family=${encodeFont(t.headingFont)}&family=${encodeFont(t.bodyFont)}&display=swap`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${gFonts}" rel="stylesheet">
<title>${esc(data.seoMeta?.title ?? brand.name)}</title>
<meta name="description" content="${esc(data.seoMeta?.description ?? "")}">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: ${bodyFont}; background: ${c.background}; color: ${c.text}; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
h1, h2, h3, h4, h5, h6 { font-family: ${headingFont}; }
button { font-family: ${bodyFont}; cursor: pointer; transition: opacity .2s, transform .1s; }
button:hover { opacity: .9; transform: translateY(-1px); }
details summary::-webkit-details-marker { display: none; }
</style>
</head>
<body>
${buildNavHtml(s.nav, c, brand)}
${buildHeroHtml(s.hero, c)}
${buildFeaturesHtml(s.features, c)}
${buildTestimonialsHtml(s.testimonials, c)}
${buildPricingHtml(s.pricing, c)}
${buildCtaHtml(s.cta, c)}
${buildFaqHtml(s.faq, c)}
${buildFooterHtml(s.footer, brand, c)}
</body>
</html>`
}

export function buildNextjsProject(data: WebsiteOutput): Record<string, string> {
  const c = data.colorPalette
  const brand = data.brand ?? { name: "My App", tagline: "", voice: "professional" }
  const code = data.componentCode ?? {}

  return {
    "package.json": JSON.stringify({
      name: (brand.name ?? "my-app").toLowerCase().replace(/\s+/g, "-"),
      version: "0.1.0",
      private: true,
      scripts: { dev: "next dev", build: "next build", start: "next start" },
      dependencies: {
        "next": "14.2.0",
        "react": "^18",
        "react-dom": "^18",
      },
      devDependencies: {
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
        "typescript": "^5",
        "tailwindcss": "^3",
        "autoprefixer": "^10",
        "postcss": "^8",
      }
    }, null, 2),
    "tailwind.config.ts": `import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '${c?.primary ?? "#d4af37"}',
        secondary: '${c?.secondary ?? "#1a1a1a"}',
        accent: '${c?.accent ?? "#d4af37"}',
        brand: { bg: '${c?.background ?? "#0a0a0a"}', surface: '${c?.surface ?? "#111"}', text: '${c?.text ?? "#fff"}', muted: '${c?.textMuted ?? "#888"}', border: '${c?.border ?? "#222"}' }
      },
      fontFamily: {
        heading: ['${data.typography?.headingFont ?? "Inter"}', 'sans-serif'],
        body: ['${data.typography?.bodyFont ?? "Inter"}', 'sans-serif'],
      },
    }
  },
  plugins: [],
}
export default config`,
    "postcss.config.js": `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`,
    "app/globals.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root {\n  --color-primary: ${c?.primary ?? "#d4af37"};\n}\n\nbody {\n  font-family: '${data.typography?.bodyFont ?? "Inter"}', system-ui, sans-serif;\n  background: ${c?.background ?? "#0a0a0a"};\n  color: ${c?.text ?? "#ffffff"};\n  -webkit-font-smoothing: antialiased;\n}`,
    "app/layout.tsx": `import type { Metadata } from 'next'
import { ${(data.typography?.headingFont ?? "Inter").replace(/ /g, "_")}, ${(data.typography?.bodyFont ?? "Inter").replace(/ /g, "_")} } from 'next/font/google'
import './globals.css'

export const metadata: Metadata = {
  title: '${(data.seoMeta?.title ?? brand.name).replace(/'/g, "\\'")}',
  description: '${(data.seoMeta?.description ?? "").replace(/'/g, "\\'")}',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
    "app/page.tsx": `import { Nav } from '@/components/Nav'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { Testimonials } from '@/components/Testimonials'
import { Pricing } from '@/components/Pricing'
import { CTA } from '@/components/CTA'
import { FAQ } from '@/components/FAQ'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
      <FAQ />
      <Footer />
    </main>
  )
}`,
    "components/Nav.tsx": code.nav ?? `'use client'
import Link from 'next/link'
export function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-brand-border backdrop-blur-xl bg-brand-bg/80 px-6">
      <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
        <span className="text-xl font-bold font-heading text-brand-text">${esc(brand.name)}</span>
        <div className="flex items-center gap-8">
          ${(data.sections?.nav?.links ?? []).map(l => `<Link href="#" className="text-sm text-brand-muted hover:text-brand-text transition-colors">${esc(l)}</Link>`).join("\n          ")}
        </div>
        <button className="bg-primary text-brand-bg px-5 py-2 rounded-lg font-semibold text-sm">Get Started</button>
      </div>
    </nav>
  )
}`,
    "components/Hero.tsx": code.hero ?? "// Hero component — customize with your content",
    "components/Features.tsx": code.features ?? "// Features component",
    "components/Testimonials.tsx": code.testimonials ?? "// Testimonials component",
    "components/Pricing.tsx": code.pricing ?? "// Pricing component",
    "components/CTA.tsx": code.cta ?? "// CTA component",
    "components/FAQ.tsx": code.faq ?? "// FAQ component",
    "components/Footer.tsx": code.footer ?? "// Footer component",
    "README.md": `# ${brand.name}\n\n${brand.tagline}\n\nGenerated by STAGEONE AI Website Builder.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nOpen [http://localhost:3000](http://localhost:3000) to see your website.`,
  }
}
