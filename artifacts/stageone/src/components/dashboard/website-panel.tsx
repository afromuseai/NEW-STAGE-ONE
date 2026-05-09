import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe, Palette, Type, Copy, Check, Loader2, Sparkles, ChevronDown, ChevronUp,
  Layout, DollarSign, HelpCircle, Star, Code
} from "lucide-react"
import { type BusinessIntelligence } from "./output-panel"
import { api } from "@/lib/api"

interface WebsiteOutput {
  colorPalette: { primary: string; secondary: string; accent: string; background: string; text: string; muted: string }
  typography: { headingFont: string; bodyFont: string; headingWeight: string; bodyWeight: string }
  pages: {
    landing: {
      hero: { headline: string; subheadline: string; ctaPrimary: string; ctaSecondary: string }
      features: Array<{ icon: string; title: string; description: string }>
      pricing: Array<{ name: string; price: string; features: string[]; cta: string; highlighted: boolean }>
      faq: Array<{ question: string; answer: string }>
      footer: { tagline: string; links: string[] }
    }
  }
  seoMeta: { title: string; description: string; keywords: string[] }
  componentCode: { hero: string; features: string; pricing: string }
}

interface WebsitePanelProps {
  businessIdea: string
  businessIntelligence: BusinessIntelligence | null
  projectId: string | null
  existingOutput?: Record<string, unknown> | null
  onSaved?: (data: Record<string, unknown>) => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="h-10 w-10 rounded-lg border border-border/50 shadow-sm" style={{ backgroundColor: color }} />
      <p className="text-[10px] text-muted-foreground font-mono">{color}</p>
      <p className="text-[10px] text-muted-foreground capitalize">{label}</p>
    </div>
  )
}

function Accordion({ title, icon: Icon, children }: { title: string; icon: typeof Globe; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button onClick={() => setOpen(p => !p)} className="flex w-full items-center justify-between p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold uppercase tracking-wider text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function WebsitePanel({ businessIdea, businessIntelligence, projectId, existingOutput, onSaved }: WebsitePanelProps) {
  const [data, setData] = useState<WebsiteOutput | null>(existingOutput as unknown as WebsiteOutput | null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [savedStatus, setSavedStatus] = useState<"idle" | "saved">("idle")

  useEffect(() => {
    if (existingOutput) setData(existingOutput as unknown as WebsiteOutput)
  }, [existingOutput])

  const generate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    setStreamingText("")

    const ideaToUse = businessIdea || businessIntelligence?.businessSnapshot || "business"

    try {
      const response = await fetch("/api/generate/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idea: ideaToUse,
          businessIntelligence,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Failed" }))
        throw new Error(err.error ?? "Generation failed")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No stream")

      const decoder = new TextDecoder()
      let lineCarryover = ""
      let finalData: WebsiteOutput | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = lineCarryover + decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")
        lineCarryover = lines.pop() ?? ""
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const raw = line.slice(6).trim()
          try {
            const parsed = JSON.parse(raw)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.done && parsed.data) finalData = parsed.data
            else if (typeof parsed.content === "string") setStreamingText(prev => prev + parsed.content)
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e
          }
        }
      }
      reader.releaseLock()

      if (finalData) {
        setData(finalData)
        // Save to project if we have an ID
        if (projectId) {
          try {
            await api.projects.update(projectId, { websiteOutput: finalData as unknown as Record<string, unknown> })
            setSavedStatus("saved")
            setTimeout(() => setSavedStatus("idle"), 3000)
            onSaved?.(finalData as unknown as Record<string, unknown>)
          } catch { /* non-fatal */ }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setIsGenerating(false)
      setStreamingText("")
    }
  }, [businessIdea, businessIntelligence, projectId, onSaved])

  if (!data && !isGenerating) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border/50 bg-secondary/20">
            <Globe className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">Generate Website Structure</h3>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            AI will create a complete landing page structure — hero copy, features, pricing tiers, FAQ, component code, and color palette.
          </p>
          <button
            onClick={generate}
            className="mt-6 flex items-center gap-2 mx-auto px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors gold-glow"
          >
            <Sparkles className="h-4 w-4" />
            Generate Website
          </button>
        </div>
      </motion.div>
    )
  }

  if (isGenerating) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 gap-6">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10"
            animate={{ boxShadow: ["0 0 20px rgba(212,175,55,0.2)", "0 0 40px rgba(212,175,55,0.4)", "0 0 20px rgba(212,175,55,0.2)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Globe className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <p className="text-sm font-semibold text-foreground">Building your website…</p>
            <p className="text-xs text-muted-foreground">Generating copy, structure, and code</p>
          </div>
        </div>
        {streamingText && (
          <div className="w-full max-w-md rounded-lg border border-border/50 bg-secondary/10 p-3">
            <p className="font-mono text-xs text-muted-foreground max-h-24 overflow-y-auto">{streamingText.slice(-300)}</p>
          </div>
        )}
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </motion.div>
    )
  }

  if (!data) return null

  const landing = data.pages?.landing
  const hero = landing?.hero
  const features = landing?.features ?? []
  const pricing = landing?.pricing ?? []
  const faq = landing?.faq ?? []
  const footer = landing?.footer

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
          <span className="text-xs font-medium text-green-400 uppercase tracking-wider">Website Generated</span>
          {savedStatus === "saved" && <span className="text-xs text-muted-foreground">· Saved</span>}
        </div>
        <button
          onClick={generate}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-lg px-3 py-1.5 hover:border-primary/50"
        >
          <RefreshCw className="h-3 w-3" />
          Regenerate
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>
      )}

      {/* SEO Meta */}
      {data.seoMeta && (
        <Accordion title="SEO & Meta" icon={Globe}>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Page Title</p>
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                <span className="text-sm text-foreground">{data.seoMeta.title}</span>
                <CopyButton text={data.seoMeta.title} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Meta Description</p>
              <div className="flex items-center justify-between rounded-lg bg-secondary/30 px-3 py-2">
                <span className="text-sm text-foreground">{data.seoMeta.description}</span>
                <CopyButton text={data.seoMeta.description} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {data.seoMeta.keywords.map((kw: string, i: number) => (
                  <span key={i} className="rounded-full border border-border/50 bg-secondary/40 px-2.5 py-0.5 text-xs text-muted-foreground">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </Accordion>
      )}

      {/* Colors + Typography */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.colorPalette && (
          <Accordion title="Color Palette" icon={Palette}>
            <div className="flex flex-wrap gap-4 pt-2">
              {Object.entries(data.colorPalette).map(([key, val]) => (
                <ColorSwatch key={key} color={val as string} label={key} />
              ))}
            </div>
          </Accordion>
        )}
        {data.typography && (
          <Accordion title="Typography" icon={Type}>
            <div className="space-y-2.5 pt-1">
              {[
                { label: "Heading Font", value: data.typography.headingFont },
                { label: "Body Font", value: data.typography.bodyFont },
                { label: "Heading Weight", value: data.typography.headingWeight },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </Accordion>
        )}
      </div>

      {/* Hero */}
      {hero && (
        <Accordion title="Hero Section" icon={Layout}>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Headline</p>
              <div className="flex items-start gap-2 rounded-lg bg-secondary/30 px-3 py-2">
                <p className="flex-1 text-base font-bold text-foreground">{hero.headline}</p>
                <CopyButton text={hero.headline} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Subheadline</p>
              <div className="flex items-start gap-2 rounded-lg bg-secondary/30 px-3 py-2">
                <p className="flex-1 text-sm text-muted-foreground">{hero.subheadline}</p>
                <CopyButton text={hero.subheadline} />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-sm font-medium text-primary text-center">{hero.ctaPrimary}</div>
              <div className="flex-1 rounded-lg bg-secondary/30 border border-border px-3 py-2 text-sm text-muted-foreground text-center">{hero.ctaSecondary}</div>
            </div>
          </div>
        </Accordion>
      )}

      {/* Features */}
      {features.length > 0 && (
        <Accordion title="Features Section" icon={Star}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {features.map((f: { icon: string; title: string; description: string }, i: number) => (
              <div key={i} className="rounded-lg bg-secondary/20 border border-border/30 p-3">
                <p className="text-sm font-medium text-foreground">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Pricing */}
      {pricing.length > 0 && (
        <Accordion title="Pricing Tiers" icon={DollarSign}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {pricing.map((tier: { name: string; price: string; features: string[]; cta: string; highlighted: boolean }, i: number) => (
              <div key={i} className={`rounded-xl p-4 border ${tier.highlighted ? "border-primary/40 bg-primary/5" : "border-border/30 bg-secondary/20"}`}>
                <p className="text-sm font-semibold text-foreground">{tier.name}</p>
                <p className={`text-xl font-bold mt-1 ${tier.highlighted ? "text-primary" : "text-foreground"}`}>{tier.price}</p>
                <ul className="mt-3 space-y-1.5">
                  {tier.features.map((f: string, j: number) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <span className="h-3.5 w-3.5 rounded-full bg-primary/30 flex items-center justify-center mt-0.5 shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className={`mt-3 rounded-lg py-1.5 text-center text-xs font-medium ${tier.highlighted ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}>
                  {tier.cta}
                </div>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <Accordion title="FAQ" icon={HelpCircle}>
          <div className="space-y-3 pt-1">
            {faq.map((item: { question: string; answer: string }, i: number) => (
              <div key={i} className="rounded-lg bg-secondary/20 border border-border/30 p-3">
                <p className="text-sm font-medium text-foreground">{item.question}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{item.answer}</p>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {/* Footer */}
      {footer && (
        <Accordion title="Footer" icon={Layout}>
          <div className="space-y-2 pt-1">
            <p className="text-sm text-muted-foreground italic">"{footer.tagline}"</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {footer.links?.map((link: string, i: number) => (
                <span key={i} className="text-xs border border-border/50 rounded px-2 py-1 text-muted-foreground">{link}</span>
              ))}
            </div>
          </div>
        </Accordion>
      )}

      {/* Component Code */}
      {data.componentCode && (
        <Accordion title="React + Tailwind Code" icon={Code}>
          <div className="space-y-3 pt-1">
            {Object.entries(data.componentCode).map(([name, code]) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground capitalize">{name} Component</p>
                  <CopyButton text={code as string} />
                </div>
                <pre className="rounded-lg bg-black/50 border border-border/30 p-3 text-xs text-green-300 font-mono overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {code as string}
                </pre>
              </div>
            ))}
          </div>
        </Accordion>
      )}
    </motion.div>
  )
}

function RefreshCw({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}
