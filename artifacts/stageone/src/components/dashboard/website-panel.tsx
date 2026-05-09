import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Globe, Palette, Sparkles, Loader2, Monitor, Smartphone,
  RefreshCw, Download, Copy, Check, Code2, Layout,
  ChevronDown, ChevronUp, Pencil, X, RotateCcw, Type,
  Layers, FileCode, Zap, Star, DollarSign, HelpCircle,
  MessageSquare, ArrowRight, Package, ExternalLink,
} from "lucide-react"
import { type BusinessIntelligence } from "./output-panel"
import { api } from "@/lib/api"
import { buildPreviewHtml, buildNextjsProject, type WebsiteOutput } from "@/lib/website-html-generator"
import JSZip from "jszip"

interface WebsitePanelProps {
  businessIdea: string
  businessIntelligence: BusinessIntelligence | null
  projectId: string | null
  existingOutput?: Record<string, unknown> | null
  onSaved?: (data: Record<string, unknown>) => void
}

type PanelTab = "design" | "sections" | "code" | "export"
type Viewport = "desktop" | "mobile"

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border/50 hover:border-primary/50">
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
      {label && <span>{copied ? "Copied!" : label}</span>}
    </button>
  )
}

function EditableField({
  value,
  onChange,
  multiline = false,
  className = "",
}: {
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => { setDraft(value) }, [value])
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  const commit = () => { onChange(draft); setEditing(false) }
  const cancel = () => { setDraft(value); setEditing(false) }

  if (editing) {
    return (
      <div className="relative">
        {multiline ? (
          <textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Escape") cancel(); if (e.key === "Enter" && !multiline) { e.preventDefault(); commit() } }}
            rows={3}
            className={`w-full bg-secondary/30 border border-primary/40 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none resize-none ${className}`}
          />
        ) : (
          <input
            ref={ref as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Escape") cancel(); if (e.key === "Enter") commit() }}
            className={`w-full bg-secondary/30 border border-primary/40 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none ${className}`}
          />
        )}
        <div className="flex items-center gap-1.5 mt-1.5">
          <button onClick={commit} className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground font-medium">Save</button>
          <button onClick={cancel} className="text-xs px-2 py-1 rounded border border-border text-muted-foreground hover:text-foreground">Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={`group relative cursor-pointer rounded-lg border border-transparent hover:border-primary/30 hover:bg-primary/5 px-3 py-2 transition-all ${className}`}
    >
      <span className="text-sm text-foreground leading-relaxed">{value || <span className="text-muted-foreground italic">Empty</span>}</span>
      <Pencil className="absolute top-2 right-2 h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  )
}

function SectionBlock({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: typeof Globe; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border/40 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(p => !p)} className="flex w-full items-center justify-between p-3 bg-secondary/10 hover:bg-secondary/20 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</span>
        </div>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="p-3 space-y-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{children}</p>
}

function ColorDot({ color, label }: { color: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(color); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
      className="flex flex-col items-center gap-1 group"
      title={color}
    >
      <div className="h-8 w-8 rounded-lg border border-border/50 shadow-sm transition-transform group-hover:scale-110" style={{ backgroundColor: color }} />
      <span className="text-[9px] text-muted-foreground font-mono group-hover:text-foreground transition-colors">{copied ? "✓" : color.slice(0, 7)}</span>
      <span className="text-[9px] text-muted-foreground capitalize">{label}</span>
    </button>
  )
}

const GENERATION_STEPS = [
  { label: "Analyzing business context", icon: Layers },
  { label: "Designing brand identity", icon: Palette },
  { label: "Crafting hero copy", icon: Layout },
  { label: "Building feature sections", icon: Zap },
  { label: "Writing testimonials", icon: MessageSquare },
  { label: "Structuring pricing tiers", icon: DollarSign },
  { label: "Generating React components", icon: Code2 },
  { label: "Finalizing export package", icon: Package },
]

function GeneratingState({ streamingText }: { streamingText: string }) {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, GENERATION_STEPS.length - 1)), 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full min-h-96 gap-8 p-8">
      <motion.div
        className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/5"
        animate={{ boxShadow: ["0 0 30px rgba(212,175,55,0.15)", "0 0 60px rgba(212,175,55,0.35)", "0 0 30px rgba(212,175,55,0.15)"] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Globe className="h-9 w-9 text-primary" />
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/30"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      <div className="w-full max-w-sm space-y-2">
        {GENERATION_STEPS.map((s, i) => {
          const Icon = s.icon
          const done = i < step
          const active = i === step
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: i <= step ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active ? "bg-primary/10 border border-primary/20" : done ? "bg-secondary/10" : ""}`}
            >
              <div className={`flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${done ? "bg-green-500/20" : active ? "bg-primary/20" : "bg-secondary/20"}`}>
                {done ? <Check className="h-3 w-3 text-green-400" /> : <Icon className={`h-3 w-3 ${active ? "text-primary" : "text-muted-foreground"}`} />}
              </div>
              <span className={`text-sm ${active ? "text-foreground font-medium" : done ? "text-muted-foreground" : "text-muted-foreground/50"}`}>{s.label}</span>
              {active && <Loader2 className="h-3.5 w-3.5 text-primary animate-spin ml-auto" />}
            </motion.div>
          )
        })}
      </div>

      {streamingText && (
        <div className="w-full max-w-sm rounded-lg border border-border/50 bg-secondary/10 p-3">
          <p className="font-mono text-[11px] text-muted-foreground max-h-20 overflow-hidden leading-relaxed">
            {streamingText.slice(-200)}
          </p>
        </div>
      )}
    </motion.div>
  )
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <motion.div
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-primary/20 bg-primary/5"
          animate={{ boxShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 40px rgba(212,175,55,0.2)", "0 0 0px rgba(212,175,55,0)"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Globe className="h-12 w-12 text-primary" />
        </motion.div>
        <h3 className="text-xl font-bold text-foreground mb-3">AI Website Builder</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          Generate a complete, startup-ready website — hero copy, features, testimonials, pricing, FAQ, React components, and a live preview.
        </p>
        <div className="flex flex-col gap-2 text-left mb-6">
          {["Live preview with desktop & mobile toggle", "Editable text blocks in every section", "React + Tailwind component code", "Export as ZIP or Next.js project"].map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="h-3 w-3 text-primary shrink-0" />{f}
            </div>
          ))}
        </div>
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 mx-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]"
        >
          <Sparkles className="h-4 w-4" />
          Generate Website
        </button>
      </div>
    </motion.div>
  )
}

export function WebsitePanel({ businessIdea, businessIntelligence, projectId, existingOutput, onSaved }: WebsitePanelProps) {
  const [data, setData] = useState<WebsiteOutput | null>(existingOutput as unknown as WebsiteOutput | null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [streamingText, setStreamingText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [tab, setTab] = useState<PanelTab>("design")
  const [viewport, setViewport] = useState<Viewport>("desktop")
  const [exportStatus, setExportStatus] = useState<"idle" | "downloading">("idle")

  useEffect(() => {
    if (existingOutput) setData(existingOutput as unknown as WebsiteOutput)
  }, [existingOutput])

  const previewHtml = useMemo(() => data ? buildPreviewHtml(data) : "", [data])

  const generate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)
    setStreamingText("")

    const ideaToUse = businessIdea || businessIntelligence?.businessSnapshot || "innovative tech startup"

    try {
      const response = await fetch("/api/generate/website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idea: ideaToUse, businessIntelligence }),
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
            if (parsed.done && parsed.data) finalData = parsed.data as WebsiteOutput
            else if (typeof parsed.content === "string") setStreamingText(prev => (prev + parsed.content).slice(-600))
          } catch (e) {
            if (e instanceof SyntaxError) continue
            throw e
          }
        }
      }
      reader.releaseLock()

      if (finalData) {
        setData(finalData)
        setTab("design")
        if (projectId) {
          setSavedStatus("saving")
          try {
            await api.projects.update(projectId, { websiteOutput: finalData as unknown as Record<string, unknown> })
            setSavedStatus("saved")
            setTimeout(() => setSavedStatus("idle"), 3000)
            onSaved?.(finalData as unknown as Record<string, unknown>)
          } catch { setSavedStatus("idle") }
        }
      } else {
        throw new Error("No data received — please try again")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed")
    } finally {
      setIsGenerating(false)
      setStreamingText("")
    }
  }, [businessIdea, businessIntelligence, projectId, onSaved])

  const updateSection = useCallback(<K extends keyof WebsiteOutput["sections"]>(
    section: K,
    updates: Partial<WebsiteOutput["sections"][K]>
  ) => {
    setData(prev => prev ? {
      ...prev,
      sections: { ...prev.sections, [section]: { ...prev.sections[section], ...updates } }
    } : prev)
  }, [])

  const updateHeroField = useCallback((field: string, value: string) => {
    setData(prev => prev ? {
      ...prev,
      sections: { ...prev.sections, hero: { ...prev.sections.hero, [field]: value } }
    } : prev)
  }, [])

  const updateFeatureItem = useCallback((i: number, field: string, value: string) => {
    setData(prev => {
      if (!prev) return prev
      const items = [...prev.sections.features.items]
      items[i] = { ...items[i], [field]: value }
      return { ...prev, sections: { ...prev.sections, features: { ...prev.sections.features, items } } }
    })
  }, [])

  const updateTestimonialItem = useCallback((i: number, field: string, value: string) => {
    setData(prev => {
      if (!prev) return prev
      const items = [...prev.sections.testimonials.items]
      items[i] = { ...items[i], [field]: value }
      return { ...prev, sections: { ...prev.sections, testimonials: { ...prev.sections.testimonials, items } } }
    })
  }, [])

  const updatePricingField = useCallback((tierIdx: number, field: string, value: string | boolean) => {
    setData(prev => {
      if (!prev) return prev
      const tiers = [...prev.sections.pricing.tiers]
      tiers[tierIdx] = { ...tiers[tierIdx], [field]: value }
      return { ...prev, sections: { ...prev.sections, pricing: { ...prev.sections.pricing, tiers } } }
    })
  }, [])

  const updateFaqItem = useCallback((i: number, field: string, value: string) => {
    setData(prev => {
      if (!prev) return prev
      const items = [...prev.sections.faq.items]
      items[i] = { ...items[i], [field]: value }
      return { ...prev, sections: { ...prev.sections, faq: { ...prev.sections.faq, items } } }
    })
  }, [])

  const handleDownloadZip = useCallback(async () => {
    if (!data) return
    setExportStatus("downloading")
    try {
      const files = buildNextjsProject(data)
      const zip = new JSZip()
      const folder = zip.folder(data.brand?.name?.toLowerCase().replace(/\s+/g, "-") ?? "my-website")!
      for (const [path, content] of Object.entries(files)) {
        const parts = path.split("/")
        if (parts.length > 1) {
          const dir = folder.folder(parts.slice(0, -1).join("/"))!
          dir.file(parts[parts.length - 1], content)
        } else {
          folder.file(path, content)
        }
      }
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${data.brand?.name?.toLowerCase().replace(/\s+/g, "-") ?? "my-website"}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("ZIP export failed:", err)
    } finally {
      setExportStatus("idle")
    }
  }, [data])

  const allCode = useMemo(() => {
    if (!data?.componentCode) return ""
    return Object.entries(data.componentCode)
      .map(([name, code]) => `// === ${name.toUpperCase()} ===\n${code}`)
      .join("\n\n")
  }, [data])

  if (!data && !isGenerating) {
    return <EmptyState onGenerate={generate} />
  }

  if (isGenerating) {
    return <GeneratingState streamingText={streamingText} />
  }

  if (!data) return null

  const TABS: Array<{ id: PanelTab; label: string; icon: typeof Globe }> = [
    { id: "design", label: "Design", icon: Palette },
    { id: "sections", label: "Sections", icon: Layout },
    { id: "code", label: "Code", icon: Code2 },
    { id: "export", label: "Export", icon: Package },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full min-h-0"
    >
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-background/50 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
          <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Website Ready</span>
          {savedStatus !== "idle" && (
            <span className={`text-xs ${savedStatus === "saved" ? "text-muted-foreground" : "text-primary"}`}>
              · {savedStatus === "saving" ? "Saving…" : "Saved"}
            </span>
          )}
          {error && <span className="text-xs text-red-400">· Error: {error}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={generate} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-lg px-2.5 py-1.5 hover:border-primary/50">
            <RefreshCw className="h-3 w-3" />Regenerate
          </button>
        </div>
      </div>

      {/* Split body */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT: Controls */}
        <div className="w-72 shrink-0 border-r border-border/40 flex flex-col min-h-0 bg-background">
          {/* Tabs */}
          <div className="flex border-b border-border/40 shrink-0">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  tab === t.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* DESIGN TAB */}
            {tab === "design" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {/* Brand */}
                <SectionBlock title="Brand" icon={Star}>
                  <Label>Name</Label>
                  <EditableField value={data.brand?.name ?? ""} onChange={v => setData(p => p ? { ...p, brand: { ...p.brand, name: v } } : p)} />
                  <Label>Tagline</Label>
                  <EditableField value={data.brand?.tagline ?? ""} onChange={v => setData(p => p ? { ...p, brand: { ...p.brand, tagline: v } } : p)} />
                  <Label>Voice</Label>
                  <div className="px-3 py-1.5 rounded-lg bg-secondary/20 text-xs text-muted-foreground capitalize">{data.brand?.voice ?? "professional"}</div>
                </SectionBlock>

                {/* Color Palette */}
                <SectionBlock title="Color Palette" icon={Palette}>
                  <div className="flex flex-wrap gap-3 pt-1">
                    {Object.entries(data.colorPalette ?? {}).map(([key, val]) => (
                      <ColorDot key={key} color={val as string} label={key.replace(/([A-Z])/g, " $1").toLowerCase()} />
                    ))}
                  </div>
                </SectionBlock>

                {/* Typography */}
                <SectionBlock title="Typography" icon={Type}>
                  {[
                    { label: "Heading Font", value: data.typography?.headingFont },
                    { label: "Body Font", value: data.typography?.bodyFont },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/20">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
                      <span className="text-xs font-medium text-foreground">{value}</span>
                    </div>
                  ))}
                </SectionBlock>

                {/* Design Style */}
                <SectionBlock title="Design System" icon={Layers}>
                  <div className="px-3 py-2 rounded-lg bg-secondary/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Style</p>
                    <p className="text-xs text-primary font-semibold capitalize">{data.design?.style ?? "glassmorphism"}</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-secondary/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">UI Direction</p>
                    <p className="text-xs text-foreground leading-relaxed">{data.design?.uiDirection ?? ""}</p>
                  </div>
                  <div className="px-3 py-2 rounded-lg bg-secondary/20">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Animations</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(data.design?.animations ?? []).map((a, i) => (
                        <span key={i} className="text-[10px] border border-primary/20 bg-primary/10 text-primary rounded px-2 py-0.5">{a}</span>
                      ))}
                    </div>
                  </div>
                </SectionBlock>

                {/* SEO */}
                <SectionBlock title="SEO Meta" icon={Globe} defaultOpen={false}>
                  <Label>Page Title</Label>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/20 gap-2">
                    <span className="text-xs text-foreground flex-1 min-w-0 truncate">{data.seoMeta?.title}</span>
                    <CopyBtn text={data.seoMeta?.title ?? ""} />
                  </div>
                  <Label>Description</Label>
                  <div className="px-3 py-2 rounded-lg bg-secondary/20">
                    <p className="text-xs text-foreground leading-relaxed">{data.seoMeta?.description}</p>
                  </div>
                  <Label>Keywords</Label>
                  <div className="flex flex-wrap gap-1">
                    {(data.seoMeta?.keywords ?? []).map((k, i) => (
                      <span key={i} className="text-[10px] border border-border/50 rounded px-2 py-0.5 text-muted-foreground">{k}</span>
                    ))}
                  </div>
                </SectionBlock>
              </motion.div>
            )}

            {/* SECTIONS TAB */}
            {tab === "sections" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {/* Hero */}
                <SectionBlock title="Hero" icon={Layout}>
                  {[
                    { key: "badge", label: "Badge" },
                    { key: "headline", label: "Headline" },
                    { key: "ctaPrimary", label: "Primary CTA" },
                    { key: "ctaSecondary", label: "Secondary CTA" },
                    { key: "socialProof", label: "Social Proof" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label>{label}</Label>
                      <EditableField value={(data.sections?.hero as Record<string, string>)?.[key] ?? ""} onChange={v => updateHeroField(key, v)} />
                    </div>
                  ))}
                  <Label>Subheadline</Label>
                  <EditableField value={data.sections?.hero?.subheadline ?? ""} onChange={v => updateHeroField("subheadline", v)} multiline />
                </SectionBlock>

                {/* Features */}
                <SectionBlock title="Features" icon={Zap} defaultOpen={false}>
                  <Label>Section Title</Label>
                  <EditableField value={data.sections?.features?.title ?? ""} onChange={v => updateSection("features", { ...data.sections.features, title: v })} />
                  {(data.sections?.features?.items ?? []).map((f, i) => (
                    <div key={i} className="border border-border/30 rounded-lg p-2 space-y-1">
                      <div className="text-[10px] text-primary font-semibold uppercase">Feature {i + 1}</div>
                      <EditableField value={f.title} onChange={v => updateFeatureItem(i, "title", v)} />
                      <EditableField value={f.description} onChange={v => updateFeatureItem(i, "description", v)} multiline />
                    </div>
                  ))}
                </SectionBlock>

                {/* Testimonials */}
                <SectionBlock title="Testimonials" icon={MessageSquare} defaultOpen={false}>
                  <Label>Section Title</Label>
                  <EditableField value={data.sections?.testimonials?.title ?? ""} onChange={v => updateSection("testimonials", { ...data.sections.testimonials, title: v })} />
                  {(data.sections?.testimonials?.items ?? []).map((t, i) => (
                    <div key={i} className="border border-border/30 rounded-lg p-2 space-y-1">
                      <div className="text-[10px] text-primary font-semibold uppercase">Testimonial {i + 1}</div>
                      <Label>Quote</Label>
                      <EditableField value={t.quote} onChange={v => updateTestimonialItem(i, "quote", v)} multiline />
                      <Label>Author</Label>
                      <EditableField value={t.author} onChange={v => updateTestimonialItem(i, "author", v)} />
                      <Label>Role & Company</Label>
                      <EditableField value={`${t.role} · ${t.company}`} onChange={v => {
                        const [role, company] = v.split("·").map(s => s.trim())
                        updateTestimonialItem(i, "role", role ?? "")
                        updateTestimonialItem(i, "company", company ?? "")
                      }} />
                    </div>
                  ))}
                </SectionBlock>

                {/* Pricing */}
                <SectionBlock title="Pricing" icon={DollarSign} defaultOpen={false}>
                  <Label>Section Title</Label>
                  <EditableField value={data.sections?.pricing?.title ?? ""} onChange={v => updateSection("pricing", { ...data.sections.pricing, title: v })} />
                  {(data.sections?.pricing?.tiers ?? []).map((tier, i) => (
                    <div key={i} className={`border rounded-lg p-2 space-y-1 ${tier.highlighted ? "border-primary/30" : "border-border/30"}`}>
                      <div className={`text-[10px] font-semibold uppercase ${tier.highlighted ? "text-primary" : "text-muted-foreground"}`}>{tier.name}</div>
                      <Label>Price</Label>
                      <EditableField value={`${tier.price}${tier.period}`} onChange={v => {
                        const match = v.match(/^([^/]+)(\/\w+)?$/)
                        updatePricingField(i, "price", match?.[1] ?? v)
                        updatePricingField(i, "period", match?.[2] ?? "")
                      }} />
                      <Label>CTA</Label>
                      <EditableField value={tier.cta} onChange={v => updatePricingField(i, "cta", v)} />
                    </div>
                  ))}
                </SectionBlock>

                {/* CTA */}
                <SectionBlock title="Call to Action" icon={ArrowRight} defaultOpen={false}>
                  <Label>Headline</Label>
                  <EditableField value={data.sections?.cta?.headline ?? ""} onChange={v => updateSection("cta", { ...data.sections.cta, headline: v })} />
                  <Label>Subheadline</Label>
                  <EditableField value={data.sections?.cta?.subheadline ?? ""} onChange={v => updateSection("cta", { ...data.sections.cta, subheadline: v })} multiline />
                  <Label>Button</Label>
                  <EditableField value={data.sections?.cta?.buttonText ?? ""} onChange={v => updateSection("cta", { ...data.sections.cta, buttonText: v })} />
                </SectionBlock>

                {/* FAQ */}
                <SectionBlock title="FAQ" icon={HelpCircle} defaultOpen={false}>
                  <Label>Section Title</Label>
                  <EditableField value={data.sections?.faq?.title ?? ""} onChange={v => updateSection("faq", { ...data.sections.faq, title: v })} />
                  {(data.sections?.faq?.items ?? []).map((item, i) => (
                    <div key={i} className="border border-border/30 rounded-lg p-2 space-y-1">
                      <div className="text-[10px] text-muted-foreground font-semibold uppercase">Q{i + 1}</div>
                      <EditableField value={item.question} onChange={v => updateFaqItem(i, "question", v)} />
                      <EditableField value={item.answer} onChange={v => updateFaqItem(i, "answer", v)} multiline />
                    </div>
                  ))}
                </SectionBlock>
              </motion.div>
            )}

            {/* CODE TAB */}
            {tab === "code" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">React + Tailwind components</p>
                  <CopyBtn text={allCode} label="Copy All" />
                </div>
                {Object.entries(data.componentCode ?? {}).map(([name, code]) => (
                  <div key={name} className="border border-border/40 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-secondary/20">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold capitalize text-foreground">{name}.tsx</span>
                      </div>
                      <CopyBtn text={code} />
                    </div>
                    <pre className="p-3 text-[10px] font-mono text-green-300/80 bg-black/60 overflow-x-auto max-h-48 overflow-y-auto leading-relaxed whitespace-pre-wrap break-all">
                      {code}
                    </pre>
                  </div>
                ))}
              </motion.div>
            )}

            {/* EXPORT TAB */}
            {tab === "export" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Export your website as a complete, ready-to-deploy project.
                </p>

                {/* Copy options */}
                <div className="border border-border/40 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-secondary/10 border-b border-border/40">
                    <p className="text-xs font-semibold text-foreground">Copy Code</p>
                  </div>
                  <div className="p-3 space-y-2">
                    {[
                      { label: "All Components", text: allCode },
                      { label: "HTML Preview", text: previewHtml },
                      { label: "Color Palette", text: JSON.stringify(data.colorPalette, null, 2) },
                      { label: "SEO Metadata", text: JSON.stringify(data.seoMeta, null, 2) },
                    ].map(({ label, text }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{label}</span>
                        <CopyBtn text={text} label="Copy" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* ZIP Download */}
                <div className="border border-border/40 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-secondary/10 border-b border-border/40">
                    <p className="text-xs font-semibold text-foreground">Download ZIP</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Full Next.js 14 project structure</p>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {["package.json", "tailwind.config.ts", "app/layout.tsx", "app/page.tsx", "components/Hero.tsx", "components/Features.tsx", "components/Pricing.tsx", "components/Testimonials.tsx", "components/CTA.tsx", "components/FAQ.tsx", "components/Footer.tsx"].map(f => (
                      <div key={f} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <FileCode className="h-2.5 w-2.5 text-primary/60 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className="px-3 pb-3">
                    <button
                      onClick={handleDownloadZip}
                      disabled={exportStatus === "downloading"}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                      {exportStatus === "downloading" ? (
                        <><Loader2 className="h-4 w-4 animate-spin" />Creating ZIP…</>
                      ) : (
                        <><Download className="h-4 w-4" />Download Next.js Project</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Preview HTML */}
                <div className="border border-border/40 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-secondary/10 border-b border-border/40">
                    <p className="text-xs font-semibold text-foreground">Standalone HTML</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Self-contained, single-file preview</p>
                  </div>
                  <div className="p-3">
                    <button
                      onClick={() => {
                        const blob = new Blob([previewHtml], { type: "text/html" })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement("a")
                        a.href = url
                        a.download = `${data.brand?.name?.toLowerCase().replace(/\s+/g, "-") ?? "website"}.html`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border hover:border-primary/50 text-foreground font-medium text-sm hover:bg-primary/5 transition-all"
                    >
                      <Download className="h-4 w-4" />Download HTML File
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Sections", value: "8" },
                    { label: "Components", value: Object.keys(data.componentCode ?? {}).length.toString() },
                    { label: "Features", value: (data.sections?.features?.items?.length ?? 0).toString() },
                    { label: "FAQ Items", value: (data.sections?.faq?.items?.length ?? 0).toString() },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-secondary/20 border border-border/30 p-2 text-center">
                      <p className="text-lg font-bold text-primary">{value}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0c0c0c]">
          {/* Preview toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-background/30 backdrop-blur-xl shrink-0">
            <span className="text-xs text-muted-foreground font-medium">Live Preview</span>
            <div className="flex items-center gap-1 bg-secondary/30 rounded-lg p-1">
              {([
                { id: "desktop" as const, icon: Monitor, label: "Desktop" },
                { id: "mobile" as const, icon: Smartphone, label: "Mobile" },
              ]).map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => setViewport(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewport === id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                const blob = new Blob([previewHtml], { type: "text/html" })
                const url = URL.createObjectURL(blob)
                window.open(url, "_blank")
              }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open full
            </button>
          </div>

          {/* Preview frame */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-6 min-h-0">
            <motion.div
              animate={{
                width: viewport === "mobile" ? 390 : "100%",
                maxWidth: viewport === "mobile" ? 390 : 1280,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative rounded-xl overflow-hidden border border-border/40 shadow-2xl"
              style={{ minHeight: 600 }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border-b border-white/5">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/70" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
                  <div className="h-3 w-3 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 bg-[#111] rounded-md px-3 py-1 text-[11px] text-muted-foreground font-mono">
                  {data.seoMeta?.title ? `${data.brand?.name?.toLowerCase().replace(/\s+/g, "-")}.com` : "preview.local"}
                </div>
              </div>
              <iframe
                key={`${viewport}-${JSON.stringify(data.sections?.hero?.headline)}`}
                srcDoc={previewHtml}
                title="Website Preview"
                className="w-full border-0 bg-white"
                style={{ height: viewport === "mobile" ? 844 : 900 }}
                sandbox="allow-scripts allow-same-origin"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
