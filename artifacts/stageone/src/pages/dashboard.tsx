import { useState, useCallback, useRef, useEffect } from "react"
import { useLocation } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { InputPanel } from "@/components/dashboard/input-panel"
import { OutputPanel, type BusinessIntelligence } from "@/components/dashboard/output-panel"
import { WebsitePanel } from "@/components/dashboard/website-panel"
import { useAuth } from "@/lib/auth-context"
import { api, type Project } from "@/lib/api"
import {
  FolderOpen,
  Plus,
  Clock,
  Sparkles,
  Trash2,
  BarChart3,
  Globe,
  ChevronRight,
  TrendingUp,
} from "lucide-react"

type Tab = "overview" | "new" | "projects"

function getTab(search: string): Tab {
  const p = new URLSearchParams(search.replace("?", ""))
  const t = p.get("tab")
  if (t === "new" || t === "projects") return t
  return "overview"
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [location] = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const activeTab = getTab(typeof window !== "undefined" ? window.location.search : "")

  // Generation state
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<BusinessIntelligence | null>(null)
  const [currentIdea, setCurrentIdea] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [streamingText, setStreamingText] = useState("")
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [showWebsite, setShowWebsite] = useState(false)

  // Projects state
  const [projects, setProjects] = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const projectsRef = useRef<Project[]>([])

  const [, setLocation] = useLocation()

  useEffect(() => {
    api.projects.list().then(({ projects }) => {
      setProjects(projects)
      projectsRef.current = projects
    }).catch(() => {}).finally(() => setProjectsLoading(false))
  }, [])

  const handleGenerate = useCallback(async (idea: string) => {
    setIsLoading(true)
    setResults(null)
    setCurrentIdea(idea)
    setError(null)
    setStreamingText("")
    setShowWebsite(false)
    setActiveProjectId(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idea }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Request failed" }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response stream available")

      const decoder = new TextDecoder()
      let lineCarryover = ""
      let finalData: BusinessIntelligence | null = null
      let streamError: string | null = null

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = lineCarryover + decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")
          lineCarryover = lines.pop() ?? ""
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6).trim()
            if (!data) continue
            try {
              const parsed = JSON.parse(data)
              if (parsed.error) { streamError = parsed.error; break }
              if (parsed.done && parsed.data) finalData = parsed.data as BusinessIntelligence
              else if (typeof parsed.content === "string") setStreamingText(prev => prev + parsed.content)
            } catch { /* incomplete */ }
          }
          if (streamError) break
        }
      } finally { reader.releaseLock() }

      if (streamError) throw new Error(streamError)
      if (!finalData) throw new Error("No analysis data received")

      setResults(finalData)

      // Auto-save to DB
      setSaveStatus("saving")
      const title = idea.length > 60 ? idea.slice(0, 60) + "…" : idea
      try {
        const { project } = await api.projects.create({
          title,
          businessIdea: idea,
          output: finalData as unknown as Record<string, unknown>,
        })
        setActiveProjectId(project.id)
        const updated = [project, ...projectsRef.current].slice(0, 50)
        projectsRef.current = updated
        setProjects(updated)
        setSaveStatus("saved")
        setTimeout(() => setSaveStatus("idle"), 3000)
      } catch { setSaveStatus("idle") }

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
      setStreamingText("")
    }
  }, [])

  const handleDeleteProject = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await api.projects.delete(id)
    const updated = projectsRef.current.filter(p => p.id !== id)
    projectsRef.current = updated
    setProjects(updated)
    if (activeProjectId === id) {
      setActiveProjectId(null)
      setResults(null)
    }
  }, [activeProjectId])

  const handleOpenProject = useCallback((project: Project) => {
    setLocation(`/projects/${project.id}`)
  }, [setLocation])

  const formatDate = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    const hrs = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 1) return "Just now"
    if (mins < 60) return `${mins}m ago`
    if (hrs < 24) return `${hrs}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(d).toLocaleDateString()
  }

  const renderOverview = () => (
    <div className="p-6 space-y-6">
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, <span className="text-primary">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your STAGEONE command center.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Projects", value: projects.length, icon: FolderOpen, color: "text-blue-400" },
          { label: "This Week", value: projects.filter(p => Date.now() - new Date(p.createdAt).getTime() < 7 * 86400000).length, icon: TrendingUp, color: "text-green-400" },
          { label: "With Websites", value: projects.filter(p => p.websiteOutput).length, icon: Globe, color: "text-primary" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-60`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick action */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        onClick={() => setLocation("/dashboard?tab=new")}
        className="w-full flex items-center gap-4 glass-card rounded-xl p-5 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">New Business Analysis</p>
          <p className="text-sm text-muted-foreground mt-0.5">Enter your idea → get full AI intelligence in seconds</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </motion.button>

      {/* Recent projects */}
      {projects.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Projects</h2>
            <button onClick={() => setLocation("/dashboard?tab=projects")} className="text-xs text-primary hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-2">
            {projects.slice(0, 4).map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                onClick={() => handleOpenProject(project)}
                className="flex items-center gap-3 glass-card rounded-lg p-3 hover:border-primary/30 cursor-pointer transition-all group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(project.updatedAt)}</p>
                </div>
                {project.websiteOutput && (
                  <Globe className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && !projectsLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 glass-card rounded-xl"
        >
          <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No projects yet</p>
          <p className="text-muted-foreground text-sm mt-1">Start your first business analysis</p>
          <button
            onClick={() => setLocation("/dashboard?tab=new")}
            className="mt-4 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Generate Now
          </button>
        </motion.div>
      )}
    </div>
  )

  const renderProjects = () => (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">All Projects</h2>
        <button
          onClick={() => setLocation("/dashboard?tab=new")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New
        </button>
      </div>

      {projectsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {!projectsLoading && projects.length === 0 && (
        <div className="text-center py-16 glass-card rounded-xl">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground mt-1">Your saved analyses will appear here</p>
        </div>
      )}

      <div className="grid gap-3">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => handleOpenProject(project)}
            className="glass-card rounded-xl p-4 hover:border-primary/30 cursor-pointer transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{project.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{project.businessIdea}</p>
                <div className="flex items-center gap-3 mt-2">
                  {project.websiteOutput && (
                    <span className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
                      <Globe className="h-2.5 w-2.5" /> Website
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" /> {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleDeleteProject(project.id, e)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderNew = () => (
    <div className="flex flex-1 flex-col lg:flex-row min-h-0">
      <aside className="w-full border-b border-border/50 bg-secondary/20 p-6 lg:w-[400px] lg:border-b-0 lg:border-r xl:w-[450px] shrink-0">
        <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
        {saveStatus !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 rounded-lg border p-3 text-sm flex items-center gap-2 ${
              saveStatus === "saved"
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-primary/20 bg-primary/10 text-primary"
            }`}
          >
            {saveStatus === "saving" ? (
              <><div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" /> Saving project…</>
            ) : (
              <><span className="h-3 w-3 rounded-full bg-green-400 inline-block" /> Project saved</>
            )}
          </motion.div>
        )}
      </aside>

      <section className={`flex-1 min-h-0 ${showWebsite ? "overflow-hidden flex flex-col" : "overflow-y-auto p-6"}`}>
        <AnimatePresence mode="wait">
          {!showWebsite ? (
            <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <OutputPanel
                data={results}
                isLoading={isLoading}
                streamingText={streamingText}
                onGenerateWebsite={results ? () => setShowWebsite(true) : undefined}
              />
            </motion.div>
          ) : (
            <motion.div key="website" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 min-h-0">
              <div className="px-4 pt-3 pb-0 shrink-0">
                <button onClick={() => setShowWebsite(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                  ← Back to Analysis
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <WebsitePanel
                  businessIdea={currentIdea}
                  businessIntelligence={results}
                  projectId={activeProjectId}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  )

  const tabFromSearch = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("tab") : null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(p => !p)} />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 shrink-0">
          <h2 className="text-sm font-medium text-foreground">
            {tabFromSearch === "new" ? "New Generation" : tabFromSearch === "projects" ? "Projects" : "Dashboard"}
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
            <span className="text-xs text-muted-foreground">STAGEONE Intelligence</span>
          </div>
        </header>

        {/* Content */}
        <div className={`flex-1 min-h-0 ${tabFromSearch === "new" ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}>
          <AnimatePresence mode="wait">
            {tabFromSearch === "new" ? (
              <motion.div key="new" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col flex-1 min-h-0">
                {renderNew()}
              </motion.div>
            ) : tabFromSearch === "projects" ? (
              <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {renderProjects()}
              </motion.div>
            ) : (
              <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {renderOverview()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
