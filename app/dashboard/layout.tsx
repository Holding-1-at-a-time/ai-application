import type React from "react"
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { getAuthToken } from "@/lib/auth"
import Sidebar from "@/components/sidebar"
import Notifications from "@/components/notifications"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { userId, orgId, orgRole } = auth()

    if (!userId || !orgId) {
        redirect("/sign-in")
    }

    const token = await getAuthToken()

    // Get user profile
    const user = await fetchQuery(api.users.getUserProfile, { userId }, { token })

    return (
        <div className="flex min-h-screen">
            <Sidebar orgRole={orgRole} />
            <div className="flex-1">
                <header className="border-b p-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <Notifications />
                        {/* Other header elements */}
                    </div>
                </header>
                <main className="p-6">{children}</main>
            </div>
        </div>
    )
}

