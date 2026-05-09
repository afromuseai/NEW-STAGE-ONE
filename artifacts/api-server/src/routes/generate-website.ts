import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const websiteSystemPrompt = `You are an elite web designer, copywriter, and UI architect. Given a business idea, generate a complete, production-ready website package.

Return ONLY valid JSON with this exact shape (no markdown, no explanation):
{
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "surface": "#hex",
    "text": "#hex",
    "textMuted": "#hex",
    "border": "#hex"
  },
  "typography": {
    "headingFont": "Font Name (from Google Fonts)",
    "bodyFont": "Font Name (from Google Fonts)",
    "headingStyle": "tight|normal|wide",
    "bodySize": "14px|16px|18px"
  },
  "brand": {
    "name": "Company Name",
    "tagline": "Short punchy tagline",
    "voice": "professional|bold|playful|technical"
  },
  "design": {
    "style": "glassmorphism|minimal|bold|elegant",
    "uiDirection": "2-sentence description of the visual direction",
    "animations": ["fade-in", "slide-up", "scale-in", "stagger-children"],
    "borderRadius": "sm|md|lg|xl|2xl",
    "glassmorphism": true
  },
  "sections": {
    "nav": {
      "logo": "Brand Name",
      "links": ["Features", "Pricing", "Testimonials", "FAQ", "Blog"]
    },
    "hero": {
      "badge": "Short eyebrow text (e.g. 'Now in public beta')",
      "headline": "Bold, compelling 6-8 word headline",
      "subheadline": "2-sentence value proposition, benefit-focused, clear",
      "ctaPrimary": "Primary CTA text",
      "ctaSecondary": "Secondary CTA text",
      "socialProof": "e.g. 'Trusted by 500+ founders'"
    },
    "features": {
      "title": "Section headline",
      "subtitle": "1-sentence section context",
      "items": [
        { "icon": "Zap", "title": "Feature name", "description": "20-word benefit description" },
        { "icon": "Target", "title": "Feature name", "description": "20-word benefit description" },
        { "icon": "Shield", "title": "Feature name", "description": "20-word benefit description" },
        { "icon": "Rocket", "title": "Feature name", "description": "20-word benefit description" },
        { "icon": "Globe", "title": "Feature name", "description": "20-word benefit description" },
        { "icon": "Sparkles", "title": "Feature name", "description": "20-word benefit description" }
      ]
    },
    "testimonials": {
      "title": "Section headline",
      "items": [
        { "quote": "Compelling 1-2 sentence testimonial quote", "author": "Name", "role": "Job Title", "company": "Company" },
        { "quote": "Compelling 1-2 sentence testimonial quote", "author": "Name", "role": "Job Title", "company": "Company" },
        { "quote": "Compelling 1-2 sentence testimonial quote", "author": "Name", "role": "Job Title", "company": "Company" }
      ]
    },
    "pricing": {
      "title": "Section headline",
      "subtitle": "1-sentence value framing",
      "tiers": [
        { "name": "Starter", "price": "$X", "period": "/mo", "description": "Who this is for", "features": ["Feature", "Feature", "Feature"], "cta": "Get Started", "highlighted": false, "badge": null },
        { "name": "Pro", "price": "$X", "period": "/mo", "description": "Who this is for", "features": ["Feature", "Feature", "Feature", "Feature", "Feature"], "cta": "Start Free Trial", "highlighted": true, "badge": "Most Popular" },
        { "name": "Enterprise", "price": "Custom", "period": "", "description": "Who this is for", "features": ["Feature", "Feature", "Feature", "Feature", "Feature", "Feature"], "cta": "Contact Sales", "highlighted": false, "badge": null }
      ]
    },
    "cta": {
      "headline": "Strong closing CTA headline",
      "subheadline": "1-sentence urgency or value reinforcement",
      "buttonText": "Primary CTA"
    },
    "faq": {
      "title": "Section headline",
      "items": [
        { "question": "Common question?", "answer": "Clear, complete answer in 1-2 sentences." },
        { "question": "Common question?", "answer": "Clear, complete answer in 1-2 sentences." },
        { "question": "Common question?", "answer": "Clear, complete answer in 1-2 sentences." },
        { "question": "Common question?", "answer": "Clear, complete answer in 1-2 sentences." },
        { "question": "Common question?", "answer": "Clear, complete answer in 1-2 sentences." }
      ]
    },
    "footer": {
      "tagline": "Brand tagline",
      "columns": [
        { "title": "Product", "links": ["Features", "Pricing", "Changelog"] },
        { "title": "Company", "links": ["About", "Blog", "Careers"] },
        { "title": "Legal", "links": ["Privacy", "Terms", "Security"] }
      ],
      "legal": "© 2025 Company. All rights reserved."
    }
  },
  "seoMeta": {
    "title": "Page title (50-60 chars)",
    "description": "Meta description (150-160 chars, benefit-focused)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  },
  "componentCode": {
    "hero": "import React from 'react';\nexport function Hero() {\n  return (\n    <section className=\"min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6\">\n      <div className=\"max-w-4xl mx-auto text-center\">\n        <span className=\"inline-block px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-sm font-medium mb-6\">Badge text here</span>\n        <h1 className=\"text-5xl md:text-7xl font-bold text-white mb-6 leading-tight\">Your Headline Here</h1>\n        <p className=\"text-xl text-gray-400 max-w-2xl mx-auto mb-10\">Your subheadline here</p>\n        <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">\n          <button className=\"px-8 py-4 rounded-xl bg-amber-500 text-black font-bold text-lg hover:bg-amber-400 transition-all\">Primary CTA</button>\n          <button className=\"px-8 py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all\">Secondary CTA</button>\n        </div>\n      </div>\n    </section>\n  );\n}",
    "features": "import React from 'react';\nexport function Features() {\n  const features = [\n    { title: 'Feature 1', description: 'Description here', icon: '⚡' },\n    { title: 'Feature 2', description: 'Description here', icon: '🎯' },\n    { title: 'Feature 3', description: 'Description here', icon: '🛡️' },\n    { title: 'Feature 4', description: 'Description here', icon: '🚀' },\n    { title: 'Feature 5', description: 'Description here', icon: '🌍' },\n    { title: 'Feature 6', description: 'Description here', icon: '✨' },\n  ];\n  return (\n    <section className=\"py-24 px-6 bg-[#0a0a0a]\">\n      <div className=\"max-w-6xl mx-auto\">\n        <h2 className=\"text-4xl font-bold text-white text-center mb-4\">Features</h2>\n        <p className=\"text-gray-400 text-center mb-16\">Subtitle here</p>\n        <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-6\">\n          {features.map((f, i) => (\n            <div key={i} className=\"p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-amber-500/20 transition-all\">\n              <div className=\"text-3xl mb-4\">{f.icon}</div>\n              <h3 className=\"text-lg font-semibold text-white mb-2\">{f.title}</h3>\n              <p className=\"text-gray-400 text-sm\">{f.description}</p>\n            </div>\n          ))}\n        </div>\n      </div>\n    </section>\n  );\n}",
    "pricing": "import React from 'react';\nexport function Pricing() {\n  const tiers = [\n    { name: 'Starter', price: '$29', period: '/mo', features: ['Feature A', 'Feature B', 'Feature C'], cta: 'Get Started', highlighted: false },\n    { name: 'Pro', price: '$79', period: '/mo', features: ['Everything in Starter', 'Feature D', 'Feature E', 'Priority support', 'Analytics'], cta: 'Start Free Trial', highlighted: true },\n    { name: 'Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Custom integrations', 'SLA guarantee', 'Dedicated support', 'On-premise option', 'Custom contracts'], cta: 'Contact Sales', highlighted: false },\n  ];\n  return (\n    <section className=\"py-24 px-6 bg-[#0a0a0a]\">\n      <div className=\"max-w-6xl mx-auto\">\n        <h2 className=\"text-4xl font-bold text-white text-center mb-4\">Pricing</h2>\n        <p className=\"text-gray-400 text-center mb-16\">Simple, transparent pricing</p>\n        <div className=\"grid md:grid-cols-3 gap-6\">\n          {tiers.map((t, i) => (\n            <div key={i} className={`p-8 rounded-2xl border ${t.highlighted ? 'bg-amber-500/5 border-amber-500/30' : 'bg-white/[0.02] border-white/5'}`}>\n              <h3 className=\"text-xl font-bold text-white mb-1\">{t.name}</h3>\n              <div className=\"flex items-baseline gap-1 my-4\">\n                <span className={`text-4xl font-bold ${t.highlighted ? 'text-amber-400' : 'text-white'}`}>{t.price}</span>\n                <span className=\"text-gray-500 text-sm\">{t.period}</span>\n              </div>\n              <ul className=\"space-y-3 mb-8\">\n                {t.features.map((f, j) => <li key={j} className=\"flex items-center gap-2 text-sm text-gray-300\"><span className=\"text-amber-500\">✓</span>{f}</li>)}\n              </ul>\n              <button className={`w-full py-3 rounded-xl font-semibold transition-all ${t.highlighted ? 'bg-amber-500 text-black hover:bg-amber-400' : 'border border-white/10 text-white hover:bg-white/5'}`}>{t.cta}</button>\n            </div>\n          ))}\n        </div>\n      </div>\n    </section>\n  );\n}",
    "testimonials": "import React from 'react';\nexport function Testimonials() {\n  const testimonials = [\n    { quote: 'Quote one here.', author: 'Name', role: 'CEO', company: 'Company' },\n    { quote: 'Quote two here.', author: 'Name', role: 'Founder', company: 'Company' },\n    { quote: 'Quote three here.', author: 'Name', role: 'CTO', company: 'Company' },\n  ];\n  return (\n    <section className=\"py-24 px-6 bg-[#080808]\">\n      <div className=\"max-w-6xl mx-auto\">\n        <h2 className=\"text-4xl font-bold text-white text-center mb-16\">What customers say</h2>\n        <div className=\"grid md:grid-cols-3 gap-6\">\n          {testimonials.map((t, i) => (\n            <div key={i} className=\"p-6 rounded-2xl bg-white/[0.02] border border-white/5\">\n              <p className=\"text-gray-300 italic mb-6\">&ldquo;{t.quote}&rdquo;</p>\n              <div>\n                <p className=\"font-semibold text-white\">{t.author}</p>\n                <p className=\"text-sm text-gray-500\">{t.role}, {t.company}</p>\n              </div>\n            </div>\n          ))}\n        </div>\n      </div>\n    </section>\n  );\n}",
    "cta": "import React from 'react';\nexport function CTA() {\n  return (\n    <section className=\"py-24 px-6\">\n      <div className=\"max-w-4xl mx-auto text-center p-16 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20\">\n        <h2 className=\"text-4xl md:text-5xl font-bold text-white mb-4\">Ready to get started?</h2>\n        <p className=\"text-gray-400 text-lg mb-10\">Join thousands of teams already using the platform.</p>\n        <button className=\"px-10 py-4 rounded-xl bg-amber-500 text-black font-bold text-lg hover:bg-amber-400 transition-all\">Start for free</button>\n      </div>\n    </section>\n  );\n}",
    "footer": "import React from 'react';\nexport function Footer() {\n  return (\n    <footer className=\"border-t border-white/5 bg-[#050505] py-16 px-6\">\n      <div className=\"max-w-6xl mx-auto\">\n        <div className=\"grid grid-cols-2 md:grid-cols-4 gap-8 mb-12\">\n          <div className=\"col-span-2 md:col-span-1\">\n            <h3 className=\"text-white font-bold text-xl mb-3\">Brand</h3>\n            <p className=\"text-gray-500 text-sm\">Your tagline here.</p>\n          </div>\n          {[['Product', ['Features', 'Pricing', 'Changelog']], ['Company', ['About', 'Blog', 'Careers']], ['Legal', ['Privacy', 'Terms', 'Security']]].map(([title, links], i) => (\n            <div key={i}>\n              <h4 className=\"text-white font-semibold mb-3\">{title}</h4>\n              <ul className=\"space-y-2\">{(links as string[]).map((l, j) => <li key={j}><a href=\"#\" className=\"text-gray-500 text-sm hover:text-white transition-colors\">{l}</a></li>)}</ul>\n            </div>\n          ))}\n        </div>\n        <div className=\"border-t border-white/5 pt-8 text-center text-gray-600 text-sm\">© 2025 Brand. All rights reserved.</div>\n      </div>\n    </footer>\n  );\n}"
  }
}

Rules:
- Generate real, compelling copy tailored specifically to this business
- Make pricing realistic for the industry vertical
- Testimonials should feel authentic with specific roles and companies
- Component code should use the exact color values from colorPalette
- Keep ALL text values under 200 chars each
- Return ONLY the JSON object, starting with { and ending with }`;

router.post("/generate/website", requireAuth, async (req, res): Promise<void> => {
  try {
    const { idea, businessIntelligence } = req.body;

    if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
      res.status(400).json({ error: "Business idea is required" });
      return;
    }

    if (!NVIDIA_API_KEY) {
      res.status(500).json({ error: "API key not configured" });
      return;
    }

    const userMessage = businessIntelligence
      ? `Generate a complete, production-ready website package for this business:\n\nIdea: "${idea}"\n\nBusiness Intelligence:\n- Industry: ${businessIntelligence.industry ?? "unknown"}\n- Target Market: ${businessIntelligence.targetMarket ?? "unknown"}\n- Business Snapshot: ${businessIntelligence.businessSnapshot ?? "unknown"}\n- Competitive Advantage: ${JSON.stringify(businessIntelligence.competitiveAdvantage ?? {})}`
      : `Generate a complete, production-ready website package for this business idea: "${idea}"`;

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta/llama-3.1-70b-instruct",
          messages: [
            { role: "system", content: websiteSystemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.65,
          max_tokens: 6000,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      req.log.error({ errorText }, "NVIDIA API error for website generation");
      res.status(500).json({ error: "Failed to generate website structure" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const decoder = new TextDecoder();
    const reader = response.body?.getReader();

    if (!reader) {
      res.status(500).json({ error: "No response body from AI" });
      return;
    }

    let contentBuffer = "";
    let lineCarryover = "";

    try {
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
          } catch { /* incomplete fragment */ }
        }
      }

      let clean = contentBuffer.trim();
      // Strip markdown fences
      if (clean.startsWith("```json")) clean = clean.slice(7);
      else if (clean.startsWith("```")) clean = clean.slice(3);
      if (clean.endsWith("```")) clean = clean.slice(0, -3);
      clean = clean.trim();
      // Find first { and last }
      const firstBrace = clean.indexOf("{");
      const lastBrace = clean.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        clean = clean.slice(firstBrace, lastBrace + 1);
      }

      try {
        const finalData = JSON.parse(clean);
        res.write(`data: ${JSON.stringify({ done: true, data: finalData })}\n\n`);
      } catch (parseErr) {
        req.log.error({ parseErr, bufferLength: contentBuffer.length }, "Website JSON parse failed");
        res.write(`data: ${JSON.stringify({ error: "Failed to parse website structure — please try again" })}\n\n`);
      }

      res.end();
    } catch (streamErr) {
      req.log.error({ streamErr }, "Website stream error");
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
        res.end();
      }
    }
  } catch (error) {
    req.log.error({ error }, "Generate website error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

export default router;
