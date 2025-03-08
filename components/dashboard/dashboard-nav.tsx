"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import {
  Calendar,
  CreditCard,
  Settings,
  User,
  Users,
  Package,
  MessageSquare,
  BarChart,
  Home,
  LogOut,
} from "lucide-react"

export function DashboardNav() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const routes = [
    {
      href: "/dashboard",
      icon: Home,
      title: "Overview",
    },
    {
      href: "/dashboard/calendar",
      icon: Calendar,
      title: "Calendar",
    },
    {
      href: "/dashboard/bookings",
      icon: CreditCard,
      title: "Bookings",
    },
    {
      href: "/dashboard/customers",
      icon: Users,
      title: "Customers",
    },
    {
      href: "/dashboard/services",
      icon: Package,
      title: "Services",
    },
    {
      href: "/dashboard/chat",
      icon: MessageSquare,
      title: "AI Chat",
    },
    {
      href: "/dashboard/analytics",
      icon: BarChart,
      title: "Analytics",
    },
    {
      href: "/dashboard/profile",
      icon: User,
      title: "Profile",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  return (
    <div className="flex h-full w-full flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-lg">AutoDetail Pro</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm">
          {routes.map((route, index) => {
            const Icon = route.icon
            return (
              <Link
                key={index}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname === route.href && "bg-muted text-primary",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{route.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full justify-start gap-3" onClick={() => signOut()}>
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </Button>
      </div>
    </div>
  )
}

