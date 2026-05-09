export interface WebsiteOutput {
  colorPalette: {
    primary: string; secondary: string; accent: string; background: string;
    surface: string; text: string; textMuted: string; border: string;
  }
  typography: { headingFont: string; bodyFont: string; headingStyle?: string; headingWeight?: string; bodySize?: string }
  brand: { name: string; tagline: string; voice: string }
  design: { style: string; uiDirection: string; animations: string[]; borderRadius: string; glassmorphism: boolean }
  sections: {
    nav: { logo: string; links: string[] }
    hero: { badge: string; headline: string; subheadline: string; ctaPrimary: string; ctaSecondary: string; socialProof: string }
    features: { title: string; subtitle: string; items: Array<{ icon: string; title: string; description: string }> }
    testimonials: { title: string; items: Array<{ quote: string; author: string; role: string; company: string; metric?: string | null }> }
    pricing: { title: string; subtitle: string; annual?: boolean; tiers: Array<{ name: string; price: string; period: string; description: string; features: string[]; cta: string; highlighted: boolean; badge: string | null }> }
    cta: { headline: string; subheadline: string; buttonText: string; subtext?: string }
    faq: { title: string; items: Array<{ question: string; answer: string }> }
    footer: { tagline: string; columns: Array<{ title: string; links: string[] }>; legal: string }
  }
  seoMeta: { title: string; description: string; keywords: string[] }
  componentCode: Record<string, string>
}

function e(s: string): string {
  return (s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
function f(name: string): string {
  return (name ?? "Inter").replace(/ /g, "+") + ":wght@300;400;500;600;700;800;900"
}

const ICON_SVG: Record<string, (c: string) => string> = {
  Zap: c => `<svg width="20" height="20" fill="none" stroke="${c}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
  Target: c => `<svg width="20" height="20" fill="none" stroke="${c}" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  Shield: c => `<svg width="20" height="20" fill="none" stroke="${c}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  Rocket: c => `<svg width="20" height="20" fill="none" stroke="${c}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 11l-4 4 1 4 4-1 4-4M15 9l-2.5-2.5M3 21l3-3M13 4l7 7-9 9-7-7z"/></svg>`,
  Globe: c => `<svg width="20" height="20" fill="none" stroke="${c}" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/></svg>`,
  Sparkles: c => `<svg width="20" height="20" fill="none" stroke="${c}" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.7.7m14.14 14.14.7.7M3 12H2m20 0h-1M4.22 19.78l.7-.7M19.07 4.93l.7-.7"/><circle cx="12" cy="12" r="4" fill="${c}" stroke="none" opacity=".3"/></svg>`,
  BarChart: c => `<svg width="20" height="20" fill="none" stroke="${c}" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="6" width="4" height="15" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg>`,
  Check: c => `<svg width="14" height="14" fill="none" stroke="${c}" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`,
  Star: c => `<svg width="14" height="14" fill="${c}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  Quote: c => `<svg width="28" height="20" fill="${c}" opacity=".2" viewBox="0 0 32 24"><path d="M0 24V14C0 6.268 4.477 1.619 13.43 0l1.906 3.047C11.142 4.239 9.048 6.273 8.571 9.143H13V24H0zm19 0V14c0-7.732 4.477-12.381 13.43-13.953L34.335 3.094C30.142 4.239 28.048 6.273 27.571 9.143H32V24H19z"/></svg>`,
}

function icon(name: string, color: string): string {
  return (ICON_SVG[name] ?? ICON_SVG["Sparkles"])(color)
}

function css(c: WebsiteOutput["colorPalette"], t: WebsiteOutput["typography"]): string {
  const hw = t.headingWeight ?? "800"
  const hs = t.headingStyle === "ultra-tight" ? "-0.05em" : t.headingStyle === "tight" ? "-0.03em" : "-0.015em"
  return `
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --p:${c.primary};--s:${c.secondary};--a:${c.accent};
  --bg:${c.background};--sf:${c.surface};
  --tx:${c.text};--tm:${c.textMuted};--br:${c.border};
  --hf:'${t.headingFont}',system-ui,sans-serif;
  --bf:'${t.bodyFont}',system-ui,sans-serif;
}
html{scroll-behavior:smooth}
body{font-family:var(--bf);background:var(--bg);color:var(--tx);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;overflow-x:hidden}
h1,h2,h3,h4,h5,h6{font-family:var(--hf);font-weight:${hw};letter-spacing:${hs};line-height:1.05}
a{text-decoration:none;color:inherit}
button{font-family:var(--bf);cursor:pointer;border:none;outline:none;transition:all .2s ease}
button:hover{opacity:.9;transform:translateY(-1px)}
img{max-width:100%}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.animate-fadeUp{animation:fadeUp .6s ease both}
.animate-fadeIn{animation:fadeIn .5s ease both}
.d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.d4{animation-delay:.4s}.d5{animation-delay:.5s}.d6{animation-delay:.6s}
`
}

function navHtml(nav: WebsiteOutput["sections"]["nav"], c: WebsiteOutput["colorPalette"], brand: WebsiteOutput["brand"]): string {
  const links = (nav?.links ?? []).slice(0, 5).map(l =>
    `<a href="#" style="color:var(--tm);font-size:14px;font-weight:500;transition:color .2s" onmouseover="this.style.color='var(--tx)'" onmouseout="this.style.color='var(--tm)'">${e(l)}</a>`
  ).join("")
  return `
<nav style="position:sticky;top:0;z-index:100;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);background:${c.background}e0;border-bottom:1px solid var(--br);padding:0 max(24px,4vw)">
  <div style="max-width:1200px;margin:0 auto;height:60px;display:flex;align-items:center;justify-content:space-between;gap:32px">
    <div style="font-family:var(--hf);font-size:18px;font-weight:800;color:var(--tx);letter-spacing:-0.5px;white-space:nowrap;flex-shrink:0">${e(nav?.logo ?? brand.name)}</div>
    <div style="display:flex;align-items:center;gap:28px;flex:1;justify-content:center">${links}</div>
    <button style="background:var(--p);color:${c.background};padding:9px 20px;border-radius:8px;font-size:14px;font-weight:600;white-space:nowrap;box-shadow:0 0 20px ${c.primary}40">Get Started</button>
  </div>
</nav>`
}

function heroHtml(hero: WebsiteOutput["sections"]["hero"], c: WebsiteOutput["colorPalette"]): string {
  return `
<section style="position:relative;padding:clamp(80px,12vw,160px) max(24px,4vw) clamp(60px,10vw,120px);text-align:center;overflow:hidden;background:radial-gradient(ellipse 80% 50% at 50% -10%, ${c.primary}22, transparent),var(--bg)">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 40% at 50% 100%, ${c.secondary}18, transparent);pointer-events:none"></div>
  <div style="position:relative;max-width:820px;margin:0 auto">
    ${hero?.badge ? `<div class="animate-fadeUp" style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:100px;border:1px solid ${c.primary}40;background:${c.primary}12;color:${c.primary};font-size:13px;font-weight:600;letter-spacing:.3px;margin-bottom:28px">
      <span style="width:6px;height:6px;border-radius:50%;background:${c.primary};flex-shrink:0"></span>${e(hero.badge)}</div>` : ""}
    <h1 class="animate-fadeUp d1" style="font-size:clamp(36px,6.5vw,80px);color:var(--tx);margin-bottom:24px;max-width:700px;margin-left:auto;margin-right:auto">${e(hero?.headline ?? "")}</h1>
    <p class="animate-fadeUp d2" style="font-size:clamp(16px,2vw,20px);line-height:1.65;color:var(--tm);max-width:560px;margin:0 auto 44px;font-weight:400">${e(hero?.subheadline ?? "")}</p>
    <div class="animate-fadeUp d3" style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-bottom:32px">
      <button style="padding:15px 36px;border-radius:10px;background:var(--p);color:${c.background};font-weight:700;font-size:16px;box-shadow:0 0 40px ${c.primary}50,0 4px 16px rgba(0,0,0,.3)">${e(hero?.ctaPrimary ?? "Get Started")}</button>
      <button style="padding:15px 32px;border-radius:10px;background:transparent;color:var(--tx);font-weight:600;font-size:16px;border:1px solid var(--br)">${e(hero?.ctaSecondary ?? "Learn More")}</button>
    </div>
    ${hero?.socialProof ? `<p class="animate-fadeUp d4" style="font-size:13px;color:var(--tm);letter-spacing:.2px">${e(hero.socialProof)}</p>` : ""}
  </div>
</section>`
}

function featuresHtml(features: WebsiteOutput["sections"]["features"], c: WebsiteOutput["colorPalette"]): string {
  const items = (features?.items ?? []).map((f, i) => `
  <div class="animate-fadeUp d${Math.min(i + 1, 6)}" style="padding:28px;border-radius:16px;background:${c.surface};border:1px solid var(--br);transition:border-color .25s,transform .25s" onmouseover="this.style.borderColor='${c.primary}50';this.style.transform='translateY(-3px)'" onmouseout="this.style.borderColor='var(--br)';this.style.transform='translateY(0)'">
    <div style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:12px;background:${c.primary}18;border:1px solid ${c.primary}30;margin-bottom:18px">${icon(f.icon, c.primary)}</div>
    <h3 style="font-size:16px;font-weight:700;color:var(--tx);margin-bottom:8px;letter-spacing:-.3px">${e(f.title)}</h3>
    <p style="font-size:14px;color:var(--tm);line-height:1.65">${e(f.description)}</p>
  </div>`).join("")
  return `
<section style="padding:clamp(80px,10vw,140px) max(24px,4vw);background:var(--bg)">
  <div style="max-width:1200px;margin:0 auto">
    <div class="animate-fadeUp" style="text-align:center;margin-bottom:64px">
      <h2 style="font-size:clamp(28px,4vw,52px);color:var(--tx);margin-bottom:14px">${e(features?.title ?? "")}</h2>
      <p style="font-size:18px;color:var(--tm);max-width:480px;margin:0 auto;line-height:1.6">${e(features?.subtitle ?? "")}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px">${items}</div>
  </div>
</section>`
}

function testimonialsHtml(testimonials: WebsiteOutput["sections"]["testimonials"], c: WebsiteOutput["colorPalette"]): string {
  const stars = Array(5).fill(`${icon("Star", c.primary)}`).join("")
  const items = (testimonials?.items ?? []).map((t, i) => `
  <div class="animate-fadeUp d${Math.min(i + 1, 3)}" style="padding:32px;border-radius:20px;background:${c.surface};border:1px solid var(--br);display:flex;flex-direction:column;gap:20px">
    <div>${icon("Quote", c.primary)}</div>
    <p style="font-size:16px;line-height:1.7;color:var(--tx);font-style:italic;flex:1">"${e(t.quote)}"</p>
    ${t.metric ? `<div style="display:inline-block;padding:4px 12px;border-radius:100px;background:${c.primary}15;border:1px solid ${c.primary}30;color:${c.primary};font-size:12px;font-weight:700;letter-spacing:.5px;width:fit-content">${e(t.metric)}</div>` : ""}
    <div style="display:flex;align-items:center;gap:12px;border-top:1px solid var(--br);padding-top:20px">
      <div style="width:42px;height:42px;border-radius:50%;background:${c.primary}25;display:flex;align-items:center;justify-content:center;font-family:var(--hf);font-weight:800;font-size:16px;color:${c.primary};flex-shrink:0">${e(t.author?.[0] ?? "A")}</div>
      <div>
        <div style="font-weight:700;font-size:14px;color:var(--tx)">${e(t.author)}</div>
        <div style="font-size:13px;color:var(--tm)">${e(t.role)}, ${e(t.company)}</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:2px">${stars}</div>
    </div>
  </div>`).join("")
  return `
<section style="padding:clamp(80px,10vw,140px) max(24px,4vw);background:${c.background === "#ffffff" || c.background === "#fafafa" ? "#f5f5f5" : "#050505"}">
  <div style="max-width:1200px;margin:0 auto">
    <h2 class="animate-fadeUp" style="text-align:center;font-size:clamp(28px,4vw,52px);color:var(--tx);margin-bottom:64px">${e(testimonials?.title ?? "What customers say")}</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px">${items}</div>
  </div>
</section>`
}

function pricingHtml(pricing: WebsiteOutput["sections"]["pricing"], c: WebsiteOutput["colorPalette"]): string {
  const tiers = (pricing?.tiers ?? []).map((t, i) => `
  <div class="animate-fadeUp d${i + 1}" style="position:relative;padding:40px 36px;border-radius:24px;background:${t.highlighted ? `${c.primary}0e` : c.surface};border:${t.highlighted ? `1.5px solid ${c.primary}60` : `1px solid var(--br)`};display:flex;flex-direction:column;gap:4px;${t.highlighted ? `box-shadow:0 0 60px ${c.primary}20` : ""}">
    ${t.badge ? `<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--p);color:${c.background};padding:4px 18px;border-radius:100px;font-size:12px;font-weight:700;white-space:nowrap;letter-spacing:.5px">${e(t.badge)}</div>` : ""}
    <div style="font-size:14px;font-weight:600;color:var(--tm);text-transform:uppercase;letter-spacing:.8px;margin-bottom:4px">${e(t.name)}</div>
    <div style="display:flex;align-items:baseline;gap:3px;margin:8px 0 6px">
      <span style="font-family:var(--hf);font-size:clamp(36px,5vw,54px);font-weight:900;color:${t.highlighted ? `var(--p)` : "var(--tx)"};line-height:1">${e(t.price)}</span>
      ${t.period ? `<span style="font-size:15px;color:var(--tm)">${e(t.period)}</span>` : ""}
    </div>
    ${t.description ? `<p style="font-size:14px;color:var(--tm);margin-bottom:16px;line-height:1.5">${e(t.description)}</p>` : ""}
    <div style="flex:1;padding:20px 0;border-top:1px solid var(--br);border-bottom:1px solid var(--br);margin:12px 0;display:flex;flex-direction:column;gap:12px">
      ${(t.features ?? []).map(f => `
      <div style="display:flex;align-items:center;gap:10px">
        <div style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:${c.primary}20;display:flex;align-items:center;justify-content:center">${icon("Check", c.primary)}</div>
        <span style="font-size:14px;color:var(--tm)">${e(f)}</span>
      </div>`).join("")}
    </div>
    <button style="margin-top:20px;width:100%;padding:14px 24px;border-radius:12px;font-weight:700;font-size:15px;background:${t.highlighted ? "var(--p)" : "transparent"};color:${t.highlighted ? c.background : "var(--tx)"};border:${t.highlighted ? "none" : "1px solid var(--br)"};${t.highlighted ? `box-shadow:0 4px 24px ${c.primary}40` : ""}">${e(t.cta)}</button>
  </div>`).join("")
  return `
<section style="padding:clamp(80px,10vw,140px) max(24px,4vw);background:var(--bg)">
  <div style="max-width:1200px;margin:0 auto">
    <div class="animate-fadeUp" style="text-align:center;margin-bottom:64px">
      <h2 style="font-size:clamp(28px,4vw,52px);color:var(--tx);margin-bottom:14px">${e(pricing?.title ?? "Pricing")}</h2>
      <p style="font-size:18px;color:var(--tm)">${e(pricing?.subtitle ?? "")}</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;align-items:start">${tiers}</div>
  </div>
</section>`
}

function ctaHtml(cta: WebsiteOutput["sections"]["cta"], c: WebsiteOutput["colorPalette"]): string {
  return `
<section style="padding:clamp(80px,10vw,140px) max(24px,4vw);background:var(--bg)">
  <div style="max-width:960px;margin:0 auto">
    <div class="animate-fadeUp" style="position:relative;text-align:center;padding:clamp(60px,8vw,100px) clamp(32px,6vw,80px);border-radius:32px;background:radial-gradient(ellipse 100% 100% at 50% 50%, ${c.primary}22, ${c.surface});border:1px solid ${c.primary}35;overflow:hidden">
      <div style="position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:200px;height:200px;background:${c.primary}15;border-radius:50%;filter:blur(60px);pointer-events:none"></div>
      <h2 style="position:relative;font-size:clamp(28px,5vw,60px);color:var(--tx);margin-bottom:20px">${e(cta?.headline ?? "")}</h2>
      <p style="position:relative;font-size:18px;color:var(--tm);margin-bottom:40px;max-width:480px;margin-left:auto;margin-right:auto;line-height:1.6">${e(cta?.subheadline ?? "")}</p>
      <button style="position:relative;padding:18px 48px;border-radius:14px;background:var(--p);color:${c.background};font-weight:700;font-size:17px;box-shadow:0 0 60px ${c.primary}50,0 4px 20px rgba(0,0,0,.3)">${e(cta?.buttonText ?? "Get Started")}</button>
      ${cta?.subtext ? `<p style="position:relative;margin-top:16px;font-size:13px;color:var(--tm)">${e(cta.subtext)}</p>` : ""}
    </div>
  </div>
</section>`
}

function faqHtml(faq: WebsiteOutput["sections"]["faq"], c: WebsiteOutput["colorPalette"]): string {
  const items = (faq?.items ?? []).map((item, i) => `
  <details class="animate-fadeUp d${Math.min(i + 1, 5)}" style="border-radius:14px;border:1px solid var(--br);overflow:hidden;transition:border-color .2s" onmouseover="this.style.borderColor='${c.primary}40'" onmouseout="this.style.borderColor='var(--br)'">
    <summary style="padding:22px 28px;font-weight:600;font-size:16px;color:var(--tx);list-style:none;display:flex;justify-content:space-between;align-items:center;cursor:pointer;background:${c.surface};gap:16px">
      ${e(item.question)}
      <span style="color:var(--p);font-size:20px;flex-shrink:0;transition:transform .2s;font-weight:300">+</span>
    </summary>
    <div style="padding:22px 28px;background:var(--bg);border-top:1px solid var(--br);font-size:15px;color:var(--tm);line-height:1.75">${e(item.answer)}</div>
  </details>`).join("")
  return `
<section style="padding:clamp(80px,10vw,140px) max(24px,4vw);background:${c.background === "#ffffff" || c.background === "#fafafa" ? "#f5f5f5" : "#050505"}">
  <div style="max-width:760px;margin:0 auto">
    <h2 class="animate-fadeUp" style="text-align:center;font-size:clamp(28px,4vw,52px);color:var(--tx);margin-bottom:56px">${e(faq?.title ?? "FAQ")}</h2>
    <div style="display:flex;flex-direction:column;gap:12px">${items}</div>
  </div>
</section>`
}

function footerHtml(footer: WebsiteOutput["sections"]["footer"], brand: WebsiteOutput["brand"], c: WebsiteOutput["colorPalette"]): string {
  const cols = (footer?.columns ?? []).map(col => `
  <div>
    <div style="font-size:12px;font-weight:700;color:var(--tx);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">${e(col.title)}</div>
    ${(col.links ?? []).map(l => `<a href="#" style="display:block;font-size:14px;color:var(--tm);margin-bottom:10px;transition:color .2s" onmouseover="this.style.color='var(--tx)'" onmouseout="this.style.color='var(--tm)'">${e(l)}</a>`).join("")}
  </div>`).join("")
  return `
<footer style="background:var(--bg);border-top:1px solid var(--br);padding:clamp(48px,6vw,80px) max(24px,4vw) 32px">
  <div style="max-width:1200px;margin:0 auto">
    <div style="display:grid;grid-template-columns:1.8fr repeat(3,1fr);gap:48px;margin-bottom:48px">
      <div>
        <div style="font-family:var(--hf);font-size:18px;font-weight:800;color:var(--tx);margin-bottom:12px;letter-spacing:-.5px">${e(brand?.name ?? "")}</div>
        <p style="font-size:14px;color:var(--tm);line-height:1.65;max-width:220px">${e(footer?.tagline ?? brand?.tagline ?? "")}</p>
      </div>
      ${cols}
    </div>
    <div style="border-top:1px solid var(--br);padding-top:24px;display:flex;align-items:center;justify-content:center">
      <span style="font-size:13px;color:var(--tm)">${e(footer?.legal ?? `© ${new Date().getFullYear()} ${brand?.name}. All rights reserved.`)}</span>
    </div>
  </div>
</footer>`
}

export function buildPreviewHtml(data: WebsiteOutput): string {
  const c = data.colorPalette ?? {
    primary: "#d4af37", secondary: "#1a1a1a", accent: "#d4af37",
    background: "#0a0a0a", surface: "#111111", text: "#ffffff", textMuted: "#888888", border: "#1f1f1f"
  }
  const t = data.typography ?? { headingFont: "Inter", bodyFont: "Inter", headingWeight: "800", headingStyle: "tight" }
  const s = data.sections ?? {} as WebsiteOutput["sections"]
  const brand = data.brand ?? { name: "Brand", tagline: "", voice: "professional" }
  const fonts = `https://fonts.googleapis.com/css2?family=${f(t.headingFont)}&family=${f(t.bodyFont)}&display=swap`

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${fonts}" rel="stylesheet">
<title>${e(data.seoMeta?.title ?? brand.name)}</title>
<meta name="description" content="${e(data.seoMeta?.description ?? "")}">
<style>${css(c, t)}</style>
</head>
<body>
${navHtml(s.nav, c, brand)}
${heroHtml(s.hero, c)}
${featuresHtml(s.features, c)}
${testimonialsHtml(s.testimonials, c)}
${pricingHtml(s.pricing, c)}
${ctaHtml(s.cta, c)}
${faqHtml(s.faq, c)}
${footerHtml(s.footer, brand, c)}
</body>
</html>`
}

export function buildNextjsProject(data: WebsiteOutput): Record<string, string> {
  const c = data.colorPalette
  const brand = data.brand ?? { name: "My App", tagline: "", voice: "professional" }
  const code = data.componentCode ?? {}
  const slug = (brand.name ?? "my-app").toLowerCase().replace(/[^a-z0-9]+/g, "-")

  return {
    "package.json": JSON.stringify({ name: slug, version: "0.1.0", private: true, scripts: { dev: "next dev", build: "next build", start: "next start" }, dependencies: { next: "14.2.0", react: "^18", "react-dom": "^18" }, devDependencies: { "@types/node": "^20", "@types/react": "^18", "@types/react-dom": "^18", typescript: "^5", tailwindcss: "^3", autoprefixer: "^10", postcss: "^8" } }, null, 2),
    "tailwind.config.ts": `import type { Config } from 'tailwindcss'\nconst config: Config = {\n  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],\n  theme: { extend: { colors: { primary: '${c?.primary}', bg: '${c?.background}', surface: '${c?.surface}', muted: '${c?.textMuted}' }, fontFamily: { heading: ['${data.typography?.headingFont}', 'sans-serif'], body: ['${data.typography?.bodyFont}', 'sans-serif'] } } },\n  plugins: []\n}\nexport default config`,
    "postcss.config.js": `module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }`,
    "app/globals.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;\nbody { font-family: '${data.typography?.bodyFont}', system-ui, sans-serif; background: ${c?.background}; color: ${c?.text}; -webkit-font-smoothing: antialiased; }`,
    "app/layout.tsx": `import type { Metadata } from 'next'\nimport './globals.css'\nexport const metadata: Metadata = { title: '${(data.seoMeta?.title ?? brand.name).replace(/'/g, "\\'")}', description: '${(data.seoMeta?.description ?? "").replace(/'/g, "\\'")}' }\nexport default function RootLayout({ children }: { children: React.ReactNode }) { return (<html lang="en"><body>{children}</body></html>) }`,
    "app/page.tsx": `import { Nav } from '@/components/Nav'\nimport { Hero } from '@/components/Hero'\nimport { Features } from '@/components/Features'\nimport { Testimonials } from '@/components/Testimonials'\nimport { Pricing } from '@/components/Pricing'\nimport { CTA } from '@/components/CTA'\nimport { FAQ } from '@/components/FAQ'\nimport { Footer } from '@/components/Footer'\nexport default function Home() { return (<main><Nav /><Hero /><Features /><Testimonials /><Pricing /><CTA /><FAQ /><Footer /></main>) }`,
    "components/Hero.tsx": code.hero ?? "export function Hero() { return <section>Hero</section> }",
    "components/Features.tsx": code.features ?? "export function Features() { return <section>Features</section> }",
    "components/Testimonials.tsx": code.testimonials ?? "export function Testimonials() { return <section>Testimonials</section> }",
    "components/Pricing.tsx": code.pricing ?? "export function Pricing() { return <section>Pricing</section> }",
    "components/CTA.tsx": code.cta ?? "export function CTA() { return <section>CTA</section> }",
    "components/FAQ.tsx": code.faq ?? "export function FAQ() { return <section>FAQ</section> }",
    "components/Footer.tsx": code.footer ?? "export function Footer() { return <footer>Footer</footer> }",
    "components/Nav.tsx": `'use client'\nexport function Nav() { return (<nav className="sticky top-0 z-50 border-b backdrop-blur-xl bg-[${c?.background}]/80 px-6"><div className="max-w-6xl mx-auto h-16 flex items-center justify-between"><span className="text-xl font-black">${e(brand.name)}</span><button className="px-5 py-2 rounded-lg font-semibold text-sm" style={{background:'${c?.primary}'}}>Get Started</button></div></nav>) }`,
    "README.md": `# ${brand.name}\n\n${brand.tagline}\n\nGenerated by STAGEONE AI Website Builder.\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``,
  }
}
