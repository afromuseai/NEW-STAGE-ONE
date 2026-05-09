import { useState, useEffect, useCallback } from "react"
import { DashboardHeader } from "@/components/dashboard/header"
import { InputPanel } from "@/components/dashboard/input-panel"
import { OutputPanel, type BusinessIntelligence } from "@/components/dashboard/output-panel"
import { Sidebar, type Project } from "@/components/dashboard/sidebar"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<BusinessIntelligence | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentIdea, setCurrentIdea] = useState("")
  const [streamingText, setStreamingText] = useState("")

  useEffect(() => {
    const savedProjects = localStorage.getItem("stageone-projects")
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects))
      } catch {
        localStorage.removeItem("stageone-projects")
      }
    }
  }, [])

  const saveProjects = useCallback((newProjects: Project[]) => {
    setProjects(newProjects)
    localStorage.setItem("stageone-projects", JSON.stringify(newProjects))
  }, [])

  const handleGenerate = useCallback(async (idea: string) => {
    setIsLoading(true)
    setResults(null)
    setError(null)
    setCurrentIdea(idea)
    setStreamingText("")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

          // Prepend carryover before processing new chunk
          const chunk = lineCarryover + decoder.decode(value, { stream: true })
          const lines = chunk.split("\n")

          // Last element may be incomplete — carry it forward
          lineCarryover = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue

            const data = line.slice(6).trim()
            if (!data) continue

            try {
              const parsed = JSON.parse(data)

              if (parsed.error) {
                streamError = parsed.error
                break
              }

              if (parsed.done && parsed.data) {
                finalData = parsed.data as BusinessIntelligence
              } else if (typeof parsed.content === "string") {
                setStreamingText(prev => prev + parsed.content)
              }
            } catch {
              // Incomplete JSON in this line — skip
            }
          }

          if (streamError) break
        }
      } finally {
        reader.releaseLock()
      }

      if (streamError) {
        throw new Error(streamError)
      }

      if (finalData) {
        setResults(finalData)

        const newProject: Project = {
          id: crypto.randomUUID(),
          title: idea.length > 50 ? idea.slice(0, 50) + "..." : idea,
          businessIdea: idea,
          createdAt: new Date().toISOString(),
          metrics: finalData.metrics
            ? {
                businessType: finalData.industry,
                scalabilityScore: finalData.metrics.revenueScalability,
              }
            : undefined,
        }

        setProjects(prev => {
          const updated = [newProject, ...prev].slice(0, 20)
          localStorage.setItem("stageone-projects", JSON.stringify(updated))
          return updated
        })
        setActiveProjectId(newProject.id)
      } else {
        throw new Error("No analysis data received — please try again")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred"
      setError(message)
    } finally {
      setIsLoading(false)
      setStreamingText("")
    }
  }, [])

  const handleSelectProject = useCallback(async (project: Project) => {
    setActiveProjectId(project.id)
    setCurrentIdea(project.businessIdea)
    await handleGenerate(project.businessIdea)
  }, [handleGenerate])

  const handleNewProject = useCallback(() => {
    setActiveProjectId(null)
    setCurrentIdea("")
    setResults(null)
    setError(null)
    setStreamingText("")
  }, [])

  const handleDeleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id)
      localStorage.setItem("stageone-projects", JSON.stringify(updated))
      return updated
    })
    if (activeProjectId === id) {
      handleNewProject()
    }
  }, [activeProjectId, handleNewProject])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onDeleteProject={handleDeleteProject}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      <div className="flex flex-1 flex-col min-h-screen">
        <DashboardHeader />

        <main className="flex flex-1 flex-col lg:flex-row">
          <aside className="w-full border-b border-border/50 bg-secondary/20 p-6 lg:w-[400px] lg:border-b-0 lg:border-r xl:w-[450px]">
            <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />
            {error && (
              <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
          </aside>

          <section className="flex-1 p-6">
            <OutputPanel
              data={results}
              isLoading={isLoading}
              streamingText={streamingText}
            />
          </section>
        </main>
      </div>
    </div>
  )
}
