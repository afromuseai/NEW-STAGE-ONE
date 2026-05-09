import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const STYLE_GUIDES: Record<string, string> = {
  SaaS: "Clean, precision-engineered SaaS aesthetic. Think Linear, Vercel, Tailwind CSS. Very dark background (#0a0a0a), tight typography, precise micro-spacing, single accent color (violet or indigo), grid patterns, minimal shadows. Professional developer tool feel.",
  Corporate: "Trust-first enterprise aesthetic. Deep navy backgrounds, white text, steel blue accents. Conservative but modern layout — wide sections, clear hierarchy, proof points, compliance-safe. Think Salesforce, Oracle, IBM redesigned for 2025.",
  Startup: "Bold, high-energy startup aesthetic. High contrast, punchy CTAs, product screenshots implied, orange or green accent on dark. Fast-paced copy, metric-heavy social proof. YC Demo Day energy.",
  Luxury: "Ultra-premium luxury tech aesthetic. Pure black (#000) background, gold (#d4af37) as the ONLY accent color, generous whitespace, wide letter-spacing on headings. Think Apple × Rolex × high-fashion SaaS. Every element should feel crafted.",
  Cyberpunk: "Futuristic cyberpunk aesthetic. Very dark charcoal/near-black background, neon cyan (#00f5ff) or electric purple (#bf00ff) as accent, subtle grid overlays, geometric clip-paths, monospace type accents, glitch-inspired details. Cyberpunk 2077 meets Stripe.",
  Minimal: "Ultra-minimal whitespace-first design. Either pure white or off-white (#fafafa) background, single strong accent color, maximum breathing room. Think Notion, Framer, Linear's marketing site. Let the typography do all the work.",
};

const TONE_GUIDES: Record<string, string> = {
  Professional: "Clear, authoritative, benefit-forward. Every claim backed by specificity. No hype words. Trust is built through precision. 'Reduce onboarding time by 40%' not 'super fast onboarding'.",
  Futuristic: "Forward-looking, pioneering, intelligent. Use language of the future — 'intelligent automation', 'next-generation', 'AI-native', 'built for what comes next'. Convey inevitability.",
  Corporate: "Formal enterprise language. ROI-focused, compliance-aware, scalability-oriented. Mentions security, uptime, SLAs. Speaks to executives and procurement teams as much as developers.",
  Friendly: "Warm, human, approachable. Like talking to a brilliant friend who happens to be an expert. Conversational but never casual. Encourages action through warmth, not pressure.",
  Premium: "Exclusive, aspirational, high-value. Speaks to an elite customer who expects perfection. Words like 'crafted', 'exceptional', 'curated', 'for those who demand the best'. Never discount, never beg.",
};

const BASE_SYSTEM_PROMPT = `You are an elite UI/UX designer and conversion copywriter. Generate a complete, venture-backed-quality website structure.

Return ONLY valid JSON starting with { and ending with }. No markdown, no explanation, no code fences.

Shape:
{
  "colorPalette": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "surface": "#hex", "text": "#hex", "textMuted": "#hex", "border": "#hex" },
  "typography": { "headingFont": "Google Font name", "bodyFont": "Google Font name", "headingStyle": "ultra-tight|tight|normal", "headingWeight": "800|900|700" },
  "brand": { "name": "Company Name", "tagline": "Short memorable tagline", "voice": "professional|bold|friendly|premium" },
  "design": { "style": "style name", "uiDirection": "2-sentence precise description of the visual direction", "animations": ["fade-in","slide-up","stagger","scale-in"], "borderRadius": "none|sm|md|lg|xl", "glassmorphism": true },
  "sections": {
    "nav": { "logo": "Brand name", "links": ["Features","Pricing","Testimonials","Blog","Docs"] },
    "hero": { "badge": "Short eyebrow (<40 chars)", "headline": "6-9 bold words", "subheadline": "2 sentences, benefit-focused, specific", "ctaPrimary": "Action verb + noun", "ctaSecondary": "Lower commitment action", "socialProof": "Specific trust signal e.g. '500+ teams ship faster'" },
    "features": { "title": "Section headline", "subtitle": "1-sentence context", "items": [
      { "icon": "Zap", "title": "Feature", "description": "<20 words" },
      { "icon": "Target", "title": "Feature", "description": "<20 words" },
      { "icon": "Shield", "title": "Feature", "description": "<20 words" },
      { "icon": "Rocket", "title": "Feature", "description": "<20 words" },
      { "icon": "Globe", "title": "Feature", "description": "<20 words" },
      { "icon": "Sparkles", "title": "Feature", "description": "<20 words" }
    ]},
    "testimonials": { "title": "Section headline", "items": [
      { "quote": "1-2 sentence specific result testimonial", "author": "Full Name", "role": "Title", "company": "Company", "metric": "Optional: '3x faster', '$2M saved'" },
      { "quote": "1-2 sentence specific result testimonial", "author": "Full Name", "role": "Title", "company": "Company", "metric": null },
      { "quote": "1-2 sentence specific result testimonial", "author": "Full Name", "role": "Title", "company": "Company", "metric": "Optional metric" }
    ]},
    "pricing": { "title": "Section headline", "subtitle": "Value framing", "annual": true, "tiers": [
      { "name": "Starter", "price": "$X", "period": "/mo", "description": "Who it's for", "features": ["f1","f2","f3"], "cta": "Get Started", "highlighted": false, "badge": null },
      { "name": "Pro", "price": "$X", "period": "/mo", "description": "Who it's for", "features": ["f1","f2","f3","f4","f5"], "cta": "Start Free Trial", "highlighted": true, "badge": "Most Popular" },
      { "name": "Enterprise", "price": "Custom", "period": "", "description": "Who it's for", "features": ["f1","f2","f3","f4","f5","f6"], "cta": "Contact Sales", "highlighted": false, "badge": null }
    ]},
    "cta": { "headline": "Strong close (<8 words)", "subheadline": "1 sentence urgency or value reinforcement", "buttonText": "Final CTA", "subtext": "No credit card required / Free forever / etc." },
    "faq": { "title": "FAQ headline", "items": [
      { "question": "Question?", "answer": "Complete answer in 1-2 sentences." },
      { "question": "Question?", "answer": "Complete answer in 1-2 sentences." },
      { "question": "Question?", "answer": "Complete answer in 1-2 sentences." },
      { "question": "Question?", "answer": "Complete answer in 1-2 sentences." },
      { "question": "Question?", "answer": "Complete answer in 1-2 sentences." }
    ]},
    "footer": { "tagline": "Brand tagline", "columns": [
      { "title": "Product", "links": ["Features","Pricing","Changelog","Roadmap"] },
      { "title": "Company", "links": ["About","Blog","Careers","Press"] },
      { "title": "Legal", "links": ["Privacy","Terms","Security","Cookies"] }
    ], "legal": "© 2025 Company. All rights reserved." }
  },
  "seoMeta": { "title": "Page title 50-60 chars", "description": "150-160 char meta description", "keywords": ["kw1","kw2","kw3","kw4","kw5"] },
  "componentCode": {
    "hero": "export function Hero() { return (<section className='min-h-screen flex items-center bg-[#0a0a0a] px-6'><div className='max-w-5xl mx-auto text-center'><h1 className='text-6xl font-extrabold text-white tracking-tight'>Headline</h1></div></section>) }",
    "features": "export function Features() { return (<section className='py-32 bg-[#0a0a0a]'><div className='max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6'></div></section>) }",
    "pricing": "export function Pricing() { return (<section className='py-32 bg-[#0a0a0a]'><div className='max-w-5xl mx-auto px-6'></div></section>) }",
    "testimonials": "export function Testimonials() { return (<section className='py-32 bg-black'><div className='max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6'></div></section>) }",
    "cta": "export function CTA() { return (<section className='py-32'><div className='max-w-3xl mx-auto text-center px-6'></div></section>) }",
    "footer": "export function Footer() { return (<footer className='border-t border-white/5 py-16 px-6'><div className='max-w-6xl mx-auto'></div></footer>) }"
  }
}

Rules:
- Generate REAL, specific copy for the actual business — not placeholder text
- Color palette must match the requested style exactly
- Every section must have complete, production-ready content
- Component code must use actual brand colors and content
- Return ONLY the JSON object`;

function buildPrompt(idea: string, style: string, tone: string, bi: unknown): string {
  const styleGuide = STYLE_GUIDES[style] ?? STYLE_GUIDES["SaaS"];
  const toneGuide = TONE_GUIDES[tone] ?? TONE_GUIDES["Professional"];
  const biContext = bi ? `\n\nBusiness Intelligence Context:\n${JSON.stringify(bi, null, 2).slice(0, 1000)}` : "";

  return `Generate a complete website for: "${idea}"

VISUAL STYLE: ${style}
${styleGuide}

COPY TONE: ${tone}
${toneGuide}

The design system, color palette, typography, and all copy MUST reflect the ${style} style with a ${tone} tone. This should look like a venture-backed product.${biContext}`;
}

async function streamNvidiaRequest(
  systemPrompt: string,
  userMessage: string,
  res: import("express").Response,
  req: import("express").Request,
  maxTokens = 6000
): Promise<string> {
  const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.65,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    req.log.error({ errorText }, "NVIDIA API error");
    throw new Error("AI API request failed");
  }

  const decoder = new TextDecoder();
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  let contentBuffer = "";
  let lineCarryover = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = lineCarryover + decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    lineCarryover = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) {
          contentBuffer += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      } catch { /* fragment */ }
    }
  }

  return contentBuffer;
}

function extractJson(raw: string): unknown {
  let clean = raw.trim();
  if (clean.startsWith("```json")) clean = clean.slice(7);
  else if (clean.startsWith("```")) clean = clean.slice(3);
  if (clean.endsWith("```")) clean = clean.slice(0, -3);
  clean = clean.trim();
  const first = clean.indexOf("{");
  const last = clean.lastIndexOf("}");
  if (first !== -1 && last !== -1) clean = clean.slice(first, last + 1);
  return JSON.parse(clean);
}

// POST /api/generate/website — full site generation
router.post("/generate/website", requireAuth, async (req, res): Promise<void> => {
  try {
    const { idea, style = "SaaS", tone = "Professional", businessIntelligence } = req.body;
    if (!idea || typeof idea !== "string" || !idea.trim()) {
      res.status(400).json({ error: "Business idea is required" }); return;
    }
    if (!NVIDIA_API_KEY) {
      res.status(500).json({ error: "API key not configured" }); return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let buffer = "";
    try {
      buffer = await streamNvidiaRequest(BASE_SYSTEM_PROMPT, buildPrompt(idea, style, tone, businessIntelligence), res, req, 6000);
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`); res.end(); return;
    }

    try {
      const finalData = extractJson(buffer);
      res.write(`data: ${JSON.stringify({ done: true, data: finalData })}\n\n`);
    } catch (parseErr) {
      req.log.error({ parseErr, bufLen: buffer.length }, "Website JSON parse failed");
      res.write(`data: ${JSON.stringify({ error: "Failed to parse — please try again" })}\n\n`);
    }
    res.end();
  } catch (error) {
    req.log.error({ error }, "Generate website error");
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/generate/website/section — regenerate one section
router.post("/generate/website/section", requireAuth, async (req, res): Promise<void> => {
  try {
    const { idea, style = "SaaS", tone = "Professional", sectionName, currentData } = req.body;
    if (!idea || !sectionName) {
      res.status(400).json({ error: "idea and sectionName are required" }); return;
    }
    if (!NVIDIA_API_KEY) {
      res.status(500).json({ error: "API key not configured" }); return;
    }

    const styleGuide = STYLE_GUIDES[style] ?? STYLE_GUIDES["SaaS"];
    const toneGuide = TONE_GUIDES[tone] ?? TONE_GUIDES["Professional"];

    const sectionPrompts: Record<string, string> = {
      hero: `Return ONLY a JSON object for the hero section of a website for: "${idea}". Style: ${style} (${styleGuide.slice(0, 100)}). Tone: ${tone}. Shape: { "badge": "...", "headline": "...", "subheadline": "...", "ctaPrimary": "...", "ctaSecondary": "...", "socialProof": "..." }`,
      features: `Return ONLY a JSON object for the features section for: "${idea}". Style: ${style}. Tone: ${tone}. Shape: { "title": "...", "subtitle": "...", "items": [{ "icon": "Zap|Target|Shield|Rocket|Globe|Sparkles", "title": "...", "description": "..." }] } with 6 items.`,
      testimonials: `Return ONLY a JSON object for testimonials for: "${idea}". Tone: ${tone}. Shape: { "title": "...", "items": [{ "quote": "...", "author": "...", "role": "...", "company": "...", "metric": null }] } with 3 items.`,
      pricing: `Return ONLY a JSON object for the pricing section for: "${idea}". Style: ${style}. Shape: { "title": "...", "subtitle": "...", "tiers": [{ "name": "Starter", "price": "$X", "period": "/mo", "description": "...", "features": ["..."], "cta": "...", "highlighted": false, "badge": null }, { "name": "Pro", "highlighted": true, "badge": "Most Popular" }, { "name": "Enterprise", "price": "Custom" }] }`,
      cta: `Return ONLY a JSON object for the CTA section for: "${idea}". Tone: ${tone}. Shape: { "headline": "...", "subheadline": "...", "buttonText": "...", "subtext": "..." }`,
      faq: `Return ONLY a JSON object for the FAQ section for: "${idea}". Shape: { "title": "...", "items": [{ "question": "...?", "answer": "..." }] } with 5 items.`,
      footer: `Return ONLY a JSON object for the footer section for: "${idea}". Shape: { "tagline": "...", "columns": [{ "title": "Product", "links": ["..."] }, { "title": "Company", "links": ["..."] }, { "title": "Legal", "links": ["..."] }], "legal": "© 2025 ..." }`,
    };

    const sectionPrompt = sectionPrompts[sectionName];
    if (!sectionPrompt) {
      res.status(400).json({ error: `Unknown section: ${sectionName}` }); return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let buffer = "";
    try {
      buffer = await streamNvidiaRequest(
        `You are a conversion copywriter. ${toneGuide} Return ONLY valid JSON, no explanation.`,
        sectionPrompt,
        res, req, 1500
      );
    } catch (err) {
      res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`); res.end(); return;
    }

    try {
      const sectionData = extractJson(buffer);
      res.write(`data: ${JSON.stringify({ done: true, section: sectionName, data: sectionData })}\n\n`);
    } catch {
      res.write(`data: ${JSON.stringify({ error: "Failed to parse section — try again" })}\n\n`);
    }
    res.end();
  } catch (error) {
    req.log.error({ error }, "Section regen error");
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
