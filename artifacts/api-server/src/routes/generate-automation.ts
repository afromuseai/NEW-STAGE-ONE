import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const buildSystemPrompt = () => `You are STAGEONE Automation Architect, an elite AI system that designs intelligent business automation workflows.

Return ONLY valid JSON matching this exact schema:
{
  "overview": {
    "purpose": "One sentence describing what this workflow does",
    "objective": "Specific operational goal",
    "expectedOutcome": "Measurable business result",
    "complexityScore": 1-10,
    "executionEstimate": "e.g. ~1.2s avg per trigger"
  },
  "triggers": [
    {
      "id": "t1",
      "label": "Trigger name",
      "event": "Technical event name e.g. form.submitted",
      "description": "What initiates this workflow",
      "tool": "Tool that fires this trigger e.g. Typeform"
    }
  ],
  "nodes": [
    {
      "id": "n1",
      "type": "trigger|action|ai_agent|notification|crm|database|webhook",
      "label": "Node label",
      "tool": "Tool name e.g. HubSpot",
      "description": "What this node does",
      "config": "Key config detail"
    }
  ],
  "edges": [
    { "from": "n1", "to": "n2", "label": "optional condition label" }
  ],
  "integrations": [
    {
      "name": "Tool name e.g. Slack",
      "category": "CRM|Email|Messaging|Payment|Database|AI|Analytics",
      "role": "How it's used in this workflow",
      "tier": "required|recommended|optional"
    }
  ],
  "workflowLogic": [
    {
      "step": 1,
      "nodeId": "n1",
      "action": "What happens",
      "condition": "If/when condition or null",
      "fallback": "What happens if this fails"
    }
  ],
  "aiOpportunities": [
    {
      "type": "e.g. Lead Scoring",
      "description": "How AI enhances this step",
      "impact": "high|medium|low",
      "nodeId": "which node benefits"
    }
  ],
  "agentConfig": {
    "objectives": ["Primary agent goal 1", "Goal 2"],
    "behaviors": ["Behavior setting 1", "Behavior 2"],
    "modelRecommendation": "e.g. GPT-4o or Claude 3.5 Sonnet",
    "inputSources": ["Where agent gets data"],
    "outputActions": ["What agent triggers"]
  }
}

Rules:
- Generate 5-9 nodes in a logical left-to-right flow
- Edges must connect all nodes in sequence with optional branches
- Include at least one AI agent node
- Name real tools and platforms
- Be specific to the workflow type and complexity
- NO generic responses — tailor everything to the business`;

router.post("/generate/automation", requireAuth, async (req, res): Promise<void> => {
  try {
    const {
      businessDescription,
      workflowType = "Lead Capture",
      complexity = "Intermediate",
    } = req.body;

    if (!businessDescription?.trim()) {
      res.status(400).json({ error: "businessDescription is required" });
      return;
    }
    if (!NVIDIA_API_KEY) {
      res.status(500).json({ error: "API key not configured" });
      return;
    }

    const userMessage = `Design a complete ${complexity} complexity "${workflowType}" automation workflow for this business:

"${businessDescription}"

Generate a production-ready workflow with real tool integrations, AI agent nodes, conditional logic, and measurable outcomes. Include 6-8 nodes in a clear flow.`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ err }, "NVIDIA API error");
      res.status(500).json({ error: "Failed to generate automation workflow" });
      return;
    }
    if (!response.body) {
      res.status(500).json({ error: "No response body from AI" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let carry = "";
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = carry + decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        carry = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              buffer += content;
              res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
          } catch { /* fragment */ }
        }
      }

      // Flush carry
      if (carry.startsWith("data: ")) {
        const data = carry.slice(6).trim();
        if (data && data !== "[DONE]") {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) buffer += content;
          } catch { /* ignore */ }
        }
      }

      // Clean and parse final JSON
      let clean = buffer.trim();
      if (clean.startsWith("```json")) clean = clean.slice(7);
      else if (clean.startsWith("```")) clean = clean.slice(3);
      if (clean.endsWith("```")) clean = clean.slice(0, -3);
      clean = clean.trim();

      const first = clean.indexOf("{");
      const last = clean.lastIndexOf("}");
      if (first !== -1 && last !== -1) clean = clean.slice(first, last + 1);

      try {
        const finalData = JSON.parse(clean);
        res.write(`data: ${JSON.stringify({ done: true, data: finalData })}\n\n`);
      } catch (parseErr) {
        req.log.error({ parseErr, preview: buffer.slice(0, 200) }, "Automation JSON parse failed");
        res.write(`data: ${JSON.stringify({ error: "Failed to parse AI response — please try again" })}\n\n`);
      }

      res.end();
    } catch (streamErr) {
      req.log.error({ streamErr }, "Stream error");
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: "Stream interrupted — please try again" })}\n\n`);
        res.end();
      }
    }
  } catch (error) {
    req.log.error({ error }, "Automation API error");
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
