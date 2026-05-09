import { Link, useLocation } from "wouter"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  FolderOpen,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard?tab=projects", icon: FolderOpen, label: "Projects" },
  { href: "/dashboard?tab=new", icon: Sparkles, label: "New Generation" },
  { href: "/settings", icon: Settings, label: "Settings" },
]

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const { user, logout } = useAuth()
  const [location] = useLocation()

  const isActive = (href: string) => {
    const base = href.split("?")[0]
    return location === base || location.startsWith(base + "/")
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-full flex-col border-r border-white/5 bg-[#080808] relative shrink-0"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/5 px-4">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
                <span className="text-sm font-bold text-primary-foreground">S1</span>
              </div>
              <span className="text-base font-semibold text-foreground">STAGEONE</span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary mx-auto">
            <span className="text-sm font-bold text-primary-foreground">S1</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-[72px] z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = isActive(href.split("?")[0])
          return (
            <Link key={href} href={href}>
              <div
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* New Generation CTA */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <Link href="/dashboard?tab=new">
            <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors cursor-pointer">
              <Zap className="h-4 w-4" />
              <span>New Analysis</span>
            </div>
          </Link>
        </div>
      )}

      {/* User */}
      <div className="border-t border-white/5 p-3">
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          {user && !collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  )
}
