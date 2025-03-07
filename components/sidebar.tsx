"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Settings, Users, FileText, Car, Sparkles, BellRing, Globe, Bot } from "lucide-react"

interface SidebarProps {
  orgRole: string | null
}

export default function Sidebar({ orgRole }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <nav className="w-64 border-r p-4 hidden md:block">
      <ul className="space-y-2">
        <li>
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 p-2 rounded ${
              isActive("/dashboard") ? "bg-primary/10 text-primary" : "hover:bg-muted"
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
        </li>

        {/* Admin-only links */}
        {orgRole === "org:admin" && (
          <>
            <li className="pt-4 pb-2">
              <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Tools</div>
            </li>
            <li>
              <Link
                href="/admin/analytics"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/analytics") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Sparkles size={18} />
                <span>AI Analytics</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/ai-tools"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/ai-tools") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Sparkles size={18} />
                <span>AI Tools</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/nlp"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/nlp") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Globe size={18} />
                <span>NLP Analysis</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/assistant"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/assistant") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Bot size={18} />
                <span>Business Assistant</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/reports"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/reports") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <FileText size={18} />
                <span>Executive Reports</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/alerts"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/alerts") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <BellRing size={18} />
                <span>Alerts</span>
              </Link>
            </li>

            {/* Admin Management Section */}
            <li className="pt-4 pb-2">
              <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Management
              </div>
            </li>
            <li>
              <Link
                href="/admin/users"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/users") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Users size={18} />
                <span>User Management</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/detailers"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/detailers") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Users size={18} />
                <span>Detailer Management</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/admin/settings") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Settings size={18} />
                <span>Organization Settings</span>
              </Link>
            </li>
          </>
        )}

        {/* Detailer and Admin links */}
        {(orgRole === "org:admin" || orgRole === "org:detailer") && (
          <>
            <li className="pt-4 pb-2">
              <div className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Operations
              </div>
            </li>
            <li>
              <Link
                href="/dashboard/appointments"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/dashboard/appointments") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Calendar size={18} />
                <span>Appointments</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/services"
                className={`flex items-center gap-2 p-2 rounded ${
                  isActive("/dashboard/services") ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <Car size={18} />
                <span>Services</span>
              </Link>
            </li>
          </>
        )}

        {/* Client-only links */}
        {orgRole === "org:client" && (
          <li>
            <Link
              href="/dashboard/bookings"
              className={`flex items-center gap-2 p-2 rounded ${
                isActive("/dashboard/bookings") ? "bg-primary/10 text-primary" : "hover:bg-muted"
              }`}
            >
              <Calendar size={18} />
              <span>My Bookings</span>
            </Link>
          </li>
        )}

        {/* Links for all roles */}
        <li className={orgRole !== "org:client" ? "pt-4" : ""}>
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-2 p-2 rounded ${
              isActive("/dashboard/profile") ? "bg-primary/10 text-primary" : "hover:bg-muted"
            }`}
          >
            <FileText size={18} />
            <span>My Profile</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}