import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const websiteSystemPrompt = `You are an expert web designer and copywriter. Given a business idea and optional business intelligence analysis, generate a complete website structure.

Return ONLY valid JSON with this exact shape:
{
  "colorPalette": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex",
    "muted": "#hex"
  },
  "typography": {
    "headingFont": "font name",
    "bodyFont": "font name",
    "headingWeight": "700",
    "bodyWeight": "400"
  },
  "pages": {
    "landing": {
      "hero": {
        "headline": "...",
        "subheadline": "...",
        "ctaPrimary": "...",
        "ctaSecondary": "..."
      },
      "features": [
        { "icon": "Zap", "title": "...", "description": "..." },
        { "icon": "Target", "title": "...", "description": "..." },
        { "icon": "BarChart", "title": "...", "description": "..." },
        { "icon": "Shield", "title": "...", "description": "..." },
        { "icon": "Rocket", "title": "...", "description": "..." },
        { "icon": "Globe", "title": "...", "description": "..." }
      ],
      "pricing": [
        { "name": "Starter", "price": "$X/mo", "features": ["...", "...", "..."], "cta": "Get Started", "highlighted": false },
        { "name": "Pro", "price": "$X/mo", "features": ["...", "...", "...", "..."], "cta": "Start Free Trial", "highlighted": true },
        { "name": "Enterprise", "price": "Custom", "features": ["...", "...", "...", "...", "..."], "cta": "Contact Sales", "highlighted": false }
      ],
      "faq": [
        { "question": "...", "answer": "..." },
        { "question": "...", "answer": "..." },
        { "question": "...", "answer": "..." },
        { "question": "...", "answer": "..." }
      ],
      "footer": {
        "tagline": "...",
        "links": ["Privacy Policy", "Terms of Service", "Contact", "Blog"]
      }
    }
  },
  "seoMeta": {
    "title": "...",
    "description": "...",
    "keywords": ["...", "...", "..."]
  },
  "componentCode": {
    "hero": "// React + Tailwind hero component code string",
    "features": "// React + Tailwind features grid code string",
    "pricing": "// React + Tailwind pricing cards code string"
  }
}

Rules:
- Generate professional, conversion-optimized copy
- Make pricing realistic for the industry
- Keep descriptions concise (under 20 words each)
- The componentCode should be real, copy-pasteable React + Tailwind JSX`;

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
      ? `Generate a complete website structure for this business:\n\nIdea: "${idea}"\n\nBusiness Intelligence Context:\n${JSON.stringify(businessIntelligence, null, 2)}`
      : `Generate a complete website structure for this business idea: "${idea}"`;

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
          temperature: 0.7,
          max_tokens: 4000,
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
      if (clean.startsWith("```json")) clean = clean.slice(7);
      else if (clean.startsWith("```")) clean = clean.slice(3);
      if (clean.endsWith("```")) clean = clean.slice(0, -3);
      clean = clean.trim();

      try {
        const finalData = JSON.parse(clean);
        res.write(`data: ${JSON.stringify({ done: true, data: finalData })}\n\n`);
      } catch (parseErr) {
        req.log.error({ parseErr }, "Website JSON parse failed");
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
