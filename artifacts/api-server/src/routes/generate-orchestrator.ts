import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;

const systemPrompt = `You are STAGEONE Orchestration Architect, an expert at designing multi-agent AI systems where different AI agents, workflows, and automation tools coordinate intelligently.

Return ONLY valid JSON matching this schema:
{
  "overview": {
    "goal": "One sentence: what the orchestration achieves",
    "agentCount": 3,
    "executionMode": "sequential|parallel|hybrid",
    "estimatedRuntime": "e.g. ~4.2s end-to-end"
  },
  "agents": [
    {
      "id": "agent_1",
      "name": "Agent name e.g. Lead Qualifier",
      "role": "Primary responsibility",
      "model": "Recommended model e.g. GPT-4o",
      "input": "What data this agent receives",
      "output": "What data this agent produces",
      "tools": ["Tool 1", "Tool 2"],
      "objective": "Specific measurable goal"
    }
  ],
  "chain": [
    {
      "step": 1,
      "agentId": "agent_1",
      "action": "What happens",
      "handoff": "What data gets passed to next agent",
      "condition": "Condition or null",
      "parallel": false
    }
  ],
  "dataFlow": [
    { "from": "agent_1", "to": "agent_2", "data": "Description of data passed" }
  ],
  "triggers": [
    { "event": "e.g. form.submitted", "source": "Tool name", "description": "When this runs" }
  ],
  "monitoring": {
    "successMetric": "How to measure success",
    "failureHandling": "What happens on failure",
    "loggingPlatform": "e.g. Datadog or Grafana",
    "alertChannel": "e.g. Slack #alerts"
  },
  "executionLog": [
    { "timestamp": "T+0.0s", "agent": "agent_1", "action": "Starting...", "status": "running" },
    { "timestamp": "T+1.2s", "agent": "agent_1", "action": "Complete", "status": "success" }
  ]
}

Rules:
- 3-6 agents in the chain
- Each agent has a clear single responsibility
- Execution log should have 6-10 entries showing the full run
- Be specific — name real AI models and tools
- executionLog timestamps should be realistic`;

router.post("/generate/orchestrator", requireAuth, async (req, res): Promise<void> => {
  try {
    const { goal, businessContext = "" } = req.body;
    if (!goal?.trim()) { res.status(400).json({ error: "goal is required" }); return; }
    if (!NVIDIA_API_KEY) { res.status(500).json({ error: "API key not configured" }); return; }

    const userMessage = `Design a multi-agent AI orchestration system for this goal:

Goal: "${goal}"
${businessContext ? `Business Context: ${businessContext}` : ""}

Create a complete orchestration chain with coordinated AI agents, clear data handoffs, and execution monitoring.`;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${NVIDIA_API_KEY}` },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userMessage }],
        temperature: 0.65,
        max_tokens: 3500,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) { res.status(500).json({ error: "NVIDIA API error" }); return; }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let carry = "", buffer = "";

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
            if (content) { buffer += content; res.write(`data: ${JSON.stringify({ content })}\n\n`); }
          } catch { /* fragment */ }
        }
      }

      let clean = buffer.trim();
      if (clean.startsWith("```json")) clean = clean.slice(7);
      else if (clean.startsWith("```")) clean = clean.slice(3);
      if (clean.endsWith("```")) clean = clean.slice(0, -3);
      clean = clean.trim();
      const first = clean.indexOf("{"), last = clean.lastIndexOf("}");
      if (first !== -1 && last !== -1) clean = clean.slice(first, last + 1);

      try {
        const finalData = JSON.parse(clean);
        res.write(`data: ${JSON.stringify({ done: true, data: finalData })}\n\n`);
      } catch (parseErr) {
        req.log.error({ parseErr }, "Orchestrator JSON parse failed");
        res.write(`data: ${JSON.stringify({ error: "Failed to parse AI response — please try again" })}\n\n`);
      }
      res.end();
    } catch (streamErr) {
      req.log.error({ streamErr }, "Stream error");
      if (!res.writableEnded) { res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`); res.end(); }
    }
  } catch (error) {
    req.log.error({ error }, "Orchestrator API error");
    if (!res.headersSent) res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
