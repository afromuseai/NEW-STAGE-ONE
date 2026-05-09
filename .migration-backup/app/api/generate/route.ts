import { NextRequest } from "next/server"

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY

export interface GenerateResponse {
  industry: string
  metrics: {
    marketDifficulty: number
    automationPotential: number
    revenueScalability: number
    operationalComplexity: number
    aiAdoptionOpportunity: number
  }
  businessSnapshot: string
  targetMarket: string
  strategicInsights: {
    growthBottleneck: string
    fastestChannel: string
    highestLeverageAutomation: string
    operationalRisk: string
  }
  competitiveAdvantage: {
    differentiation: string
    defensibility: string
    scalabilityEdge: string
  }
  growthPlan: string[]
  websitePages: string[]
  chatbotRole: string
  automations: string[]
  recommendedStack: {
    frontend: string[]
    backend: string[]
    automation: string[]
    crm: string
    payments: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json()

    if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Business idea is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!NVIDIA_API_KEY) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const systemPrompt = `You are STAGEONE, an elite AI Business Operating System. Analyze businesses with deep industry expertise.

INDUSTRIES YOU SPECIALIZE IN:
- SaaS (B2B/B2C software, subscriptions, usage-based pricing)
- E-commerce (DTC, marketplaces, dropshipping, retail)
- Healthcare (telehealth, medtech, health SaaS, wellness)
- Cybersecurity (enterprise security, compliance, identity)
- Education (edtech, online courses, corporate training)
- Marketplaces (two-sided, service, product)
- Agencies (marketing, dev, design, consulting)
- Fintech (payments, lending, investing, banking)
- Creator Economy (content, community, monetization)

ANALYSIS REQUIREMENTS:
- Use industry-specific terminology
- Suggest realistic infrastructure for the vertical
- Tailor automation systems to the industry
- Apply specialized growth models

Return ONLY valid JSON:
{
  "industry": "SaaS|E-commerce|Healthcare|Cybersecurity|Education|Marketplace|Agency|Fintech|Creator Economy",
  "metrics": {
    "marketDifficulty": 1-10,
    "automationPotential": 1-100,
    "revenueScalability": 1-10,
    "operationalComplexity": 1-10,
    "aiAdoptionOpportunity": 1-100
  },
  "businessSnapshot": "One sentence: business model + revenue mechanism",
  "targetMarket": "One sentence: who buys + why they buy",
  "strategicInsights": {
    "growthBottleneck": "Primary scaling constraint",
    "fastestChannel": "Highest ROI acquisition channel",
    "highestLeverageAutomation": "Most impactful automation opportunity",
    "operationalRisk": "Key operational vulnerability"
  },
  "competitiveAdvantage": {
    "differentiation": "Core unique value proposition",
    "defensibility": "Moat or barrier to competition",
    "scalabilityEdge": "What enables exponential growth"
  },
  "growthPlan": [
    "Phase 1: [Action] via [Channel] → [Metric]",
    "Phase 2: [Action] via [Channel] → [Metric]",
    "Phase 3: [Action] via [Channel] → [Metric]",
    "Phase 4: [Action] via [Channel] → [Metric]",
    "Phase 5: [Action] via [Channel] → [Metric]"
  ],
  "websitePages": [
    "Home → [conversion goal]",
    "Product → [key function]",
    "Pricing → [model type]",
    "Blog → [SEO angle]",
    "Contact → [CTA type]"
  ],
  "chatbotRole": "Primary function + key integration + escalation path",
  "automations": [
    "[Trigger] → [Action] via [Tool]",
    "[Trigger] → [Action] via [Tool]",
    "[Trigger] → [Action] via [Tool]",
    "[Trigger] → [Action] via [Tool]"
  ],
  "recommendedStack": {
    "frontend": ["Framework", "UI Library", "Hosting"],
    "backend": ["Runtime", "Database", "Auth"],
    "automation": ["Tool 1", "Tool 2"],
    "crm": "Primary CRM system",
    "payments": "Payment infrastructure"
  }
}

Rules:
- MAX 15 words per bullet
- Name real tools and platforms
- Be industry-specific, not generic
- All metrics must be realistic for the industry
- NO filler, NO motivational text`

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
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Analyze this business idea with industry-specific expertise: "${idea}"`,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
          stream: true,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("NVIDIA API error:", errorText)
      return new Response(
        JSON.stringify({ error: "Failed to generate business intelligence" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Stream the response
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        let buffer = ""

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    buffer += content
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content, buffer })}\n\n`))
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }

          // Parse the final buffer and send complete response
          let cleanContent = buffer.trim()
          if (cleanContent.startsWith("```json")) {
            cleanContent = cleanContent.slice(7)
          } else if (cleanContent.startsWith("```")) {
            cleanContent = cleanContent.slice(3)
          }
          if (cleanContent.endsWith("```")) {
            cleanContent = cleanContent.slice(0, -3)
          }
          cleanContent = cleanContent.trim()

          try {
            const finalData = JSON.parse(cleanContent) as GenerateResponse
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, data: finalData })}\n\n`))
          } catch {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Failed to parse AI response" })}\n\n`))
          }

          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Generate API error:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
