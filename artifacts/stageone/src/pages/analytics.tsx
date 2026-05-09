import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts"
import {
  BarChart3, Brain, Zap, Bot, TrendingUp, Activity,
  CheckCircle, AlertCircle, Clock, Cpu, Globe, Workflow,
} from "lucide-react"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import stageoneIcon from "@/assets/stageone-icon.png"

/* ── Mock data generation ─────────────────────────────── */
const DAYS = ["Apr 26","Apr 27","Apr 28","Apr 29","Apr 30","May 1","May 2","May 3","May 4","May 5","May 6","May 7","May 8","May 9"]
const activityData = DAYS.map((day, i) => ({
  day,
  aiCalls: Math.round(8 + Math.sin(i * 0.7) * 5 + i * 1.2),
  workflows: Math.round(3 + Math.cos(i * 0.5) * 2 + i * 0.4),
  chatbots: Math.round(6 + Math.sin(i * 0.9 + 1) * 4 + i * 0.8),
  automations: Math.round(2 + Math.cos(i * 0.6) * 1.5 + i * 0.3),
}))

const moduleData = [
  { name: "Business Intelligence", calls: 48, color: "#D4AF37" },
  { name: "Website Generator", calls: 31, color: "#6366F1" },
  { name: "AI Chatbot", calls: 67, color: "#8B5CF6" },
  { name: "Automation Builder", calls: 22, color: "#10B981" },
  { name: "Orchestrator", calls: 15, color: "#F59E0B" },
]

const perfData = DAYS.slice(-7).map((day, i) => ({
  day,
  responseTime: Math.round(1200 + Math.sin(i * 0.8) * 300),
  successRate: Math.round(94 + Math.cos(i * 0.5) * 4),
  tokenUsage: Math.round(2800 + i * 200 + Math.sin(i) * 400),
}))

const workflowTypes = [
  { name: "Lead Capture", value: 28, color: "#D4AF37" },
  { name: "Customer Onboarding", value: 19, color: "#8B5CF6" },
  { name: "Sales Pipeline", value: 22, color: "#10B981" },
  { name: "Support Automation", value: 16, color: "#3B82F6" },
  { name: "Marketing", value: 15, color: "#F59E0B" },
]

const recentActivity = [
  { time: "2m ago", event: "AI Analysis", detail: "SaaS business intelligence generated", type: "ai", status: "success" },
  { time: "8m ago", event: "Workflow Run", detail: "Lead Capture automation triggered", type: "workflow", status: "success" },
  { time: "15m ago", event: "Chatbot", detail: "E-commerce support bot responded (42 msgs)", type: "chat", status: "success" },
  { time: "31m ago", event: "Website Gen", detail: "Healthcare landing page created", type: "website", status: "success" },
  { time: "1h ago", event: "Automation", detail: "CRM sync completed — 3 records updated", type: "automation", status: "success" },
  { time: "2h ago", event: "Workflow Run", detail: "Marketing automation failed — retry scheduled", type: "workflow", status: "error" },
  { time: "3h ago", event: "AI Analysis", detail: "Fintech market analysis completed", type: "ai", status: "success" },
  { time: "4h ago", event: "Chatbot", detail: "SaaS support bot session (18 msgs)", type: "chat", status: "success" },
]

/* ── Tooltip ──────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-[#0a0a0a] p-3 shadow-xl text-xs">
      <p className="text-muted-foreground mb-2 font-semibold">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          <span className="text-foreground/70">{p.name}:</span>
          <span className="font-bold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── KPI Card ─────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ElementType; label: string; value: string; sub: string
  color: string; trend?: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 bg-white/2 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl`} style={{ background: `${color}15` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
            <TrendingUp className="h-3 w-3" />{trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-foreground/70 mt-0.5">{label}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </motion.div>
  )
}

/* ── Main ─────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "ai" | "automations" | "performance">("overview")

  const totalAICalls = useMemo(() => activityData.reduce((s, d) => s + d.aiCalls, 0), [])
  const totalWorkflows = useMemo(() => activityData.reduce((s, d) => s + d.workflows, 0), [])
  const totalChatbots = useMemo(() => activityData.reduce((s, d) => s + d.chatbots, 0), [])

  return (
    <div className="flex h-screen bg-[#050505] text-foreground overflow-hidden">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-6 h-14 shrink-0">
          <div className="flex items-center gap-3">
            <img src={stageoneIcon} alt="" className="h-6 w-6 object-contain" />
            <div>
              <h1 className="text-sm font-black text-foreground tracking-tight">Analytics</h1>
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase">AI Infrastructure Metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-3 py-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-400">All Systems Operational</span>
            </div>
            {/* Tabs */}
            <div className="flex gap-1 bg-white/3 border border-white/8 rounded-xl p-1 ml-3">
              {(["overview", "ai", "automations", "performance"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    activeTab === tab
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {tab === "ai" ? "AI Usage" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard icon={Brain} label="AI Calls (14d)" value={String(totalAICalls)} sub="NVIDIA NIM requests" color="#D4AF37" trend="+24%" />
            <KpiCard icon={Workflow} label="Workflows Run" value={String(totalWorkflows)} sub="Automation executions" color="#8B5CF6" trend="+18%" />
            <KpiCard icon={Bot} label="Chatbot Sessions" value={String(totalChatbots)} sub="Live AI conversations" color="#10B981" trend="+31%" />
            <KpiCard icon={CheckCircle} label="Success Rate" value="96.4%" sub="All AI executions" color="#3B82F6" trend="+2.1%" />
          </div>

          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Main area chart */}
              <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-foreground">AI Activity Overview</h3>
                    <p className="text-[10px] text-muted-foreground">Last 14 days across all modules</p>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    {[
                      { label: "AI Calls", color: "#D4AF37" },
                      { label: "Workflows", color: "#8B5CF6" },
                      { label: "Chatbots", color: "#10B981" },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ background: l.color }} />
                        <span className="text-muted-foreground">{l.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradWF" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradCB" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="aiCalls" name="AI Calls" stroke="#D4AF37" strokeWidth={2} fill="url(#gradAI)" />
                    <Area type="monotone" dataKey="chatbots" name="Chatbots" stroke="#10B981" strokeWidth={2} fill="url(#gradCB)" />
                    <Area type="monotone" dataKey="workflows" name="Workflows" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradWF)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Module usage */}
                <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                  <h3 className="text-sm font-black text-foreground mb-1">Module Usage</h3>
                  <p className="text-[10px] text-muted-foreground mb-4">AI calls per module</p>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={moduleData} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} width={110} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="calls" name="Calls" radius={[0, 4, 4, 0]}>
                        {moduleData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} opacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent activity */}
                <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                  <h3 className="text-sm font-black text-foreground mb-1">Recent Activity</h3>
                  <p className="text-[10px] text-muted-foreground mb-3">Last 24 hours</p>
                  <div className="space-y-2 overflow-y-auto max-h-44">
                    {recentActivity.map((a, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                        className="flex items-start gap-2.5">
                        <div className={`mt-0.5 h-1.5 w-1.5 rounded-full shrink-0 ${a.status === "success" ? "bg-emerald-400" : "bg-rose-400"}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-foreground/80">{a.event}</span>
                            <span className="text-[9px] text-muted-foreground">{a.time}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">{a.detail}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                <h3 className="text-sm font-black text-foreground mb-1">Token Usage Trend</h3>
                <p className="text-[10px] text-muted-foreground mb-4">NVIDIA NIM tokens per day</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={perfData}>
                    <defs>
                      <linearGradient id="gradToken" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="tokenUsage" name="Tokens" stroke="#D4AF37" strokeWidth={2} fill="url(#gradToken)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                <h3 className="text-sm font-black text-foreground mb-1">Workflow Distribution</h3>
                <p className="text-[10px] text-muted-foreground mb-4">By type</p>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={180}>
                    <PieChart>
                      <Pie data={workflowTypes} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                        dataKey="value" stroke="none">
                        {workflowTypes.map((e, i) => <Cell key={i} fill={e.color} opacity={0.85} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {workflowTypes.map(t => (
                      <div key={t.name} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full shrink-0" style={{ background: t.color }} />
                        <span className="text-[10px] text-muted-foreground">{t.name}</span>
                        <span className="text-[10px] font-bold text-foreground ml-auto">{t.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-2 rounded-2xl border border-white/8 bg-white/2 p-5">
                <h3 className="text-sm font-black text-foreground mb-1">AI Generation Breakdown</h3>
                <p className="text-[10px] text-muted-foreground mb-4">Daily calls by module — last 7 days</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={activityData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="aiCalls" name="AI Calls" fill="#D4AF37" opacity={0.8} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="chatbots" name="Chatbots" fill="#10B981" opacity={0.8} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="automations" name="Automations" fill="#8B5CF6" opacity={0.8} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "automations" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Total Runs", value: "183", icon: Zap, color: "#D4AF37" },
                  { label: "Active Workflows", value: "7", icon: Activity, color: "#10B981" },
                  { label: "Avg Duration", value: "1.4s", icon: Clock, color: "#8B5CF6" },
                  { label: "Failed Runs", value: "8", icon: AlertCircle, color: "#F87171" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-xl border border-white/8 bg-white/2 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <p className="text-xl font-black text-foreground">{value}</p>
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                <h3 className="text-sm font-black text-foreground mb-1">Automation Executions</h3>
                <p className="text-[10px] text-muted-foreground mb-4">Daily runs — 14 day trend</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="gradAuto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="automations" name="Automations" stroke="#10B981" strokeWidth={2} fill="url(#gradAuto)" />
                    <Area type="monotone" dataKey="workflows" name="Workflows" stroke="#D4AF37" strokeWidth={2} fill="url(#gradAI)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                <h3 className="text-sm font-black text-foreground mb-1">Response Time (ms)</h3>
                <p className="text-[10px] text-muted-foreground mb-4">Avg NVIDIA API response — last 7 days</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={perfData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} domain={[800, 1800]} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="responseTime" name="Response Time (ms)" stroke="#D4AF37" strokeWidth={2} dot={{ fill: "#D4AF37", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/2 p-5">
                <h3 className="text-sm font-black text-foreground mb-1">Success Rate (%)</h3>
                <p className="text-[10px] text-muted-foreground mb-4">AI execution success — last 7 days</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={perfData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" />
                    <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#666" }} tickLine={false} axisLine={false} domain={[88, 100]} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="successRate" name="Success %" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Avg Response Time", value: "1,240ms", icon: Clock, color: "#D4AF37", sub: "NVIDIA NIM latency" },
                  { label: "Model", value: "LLaMA 3.1 70B", icon: Cpu, color: "#8B5CF6", sub: "via NVIDIA NIM" },
                  { label: "Uptime", value: "99.98%", icon: Globe, color: "#10B981", sub: "Last 30 days" },
                ].map(({ label, value, icon: Icon, color, sub }) => (
                  <div key={label} className="rounded-xl border border-white/8 bg-white/2 p-4">
                    <Icon className="h-4 w-4 mb-2" style={{ color }} />
                    <p className="text-lg font-black text-foreground">{value}</p>
                    <p className="text-[10px] font-semibold text-foreground/70">{label}</p>
                    <p className="text-[9px] text-muted-foreground">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
