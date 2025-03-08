import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { getAuthToken } from "@/lib/auth"
import AlertSettings from "@/components/admin/alerts/alert-settings"
import AlertList from "@/components/admin/alerts/alert-list"

export default async function AdminAlertsPage() {
    const { userId, orgId, orgRole } = await auth()

    if (!userId || !orgId) {
        redirect("/sign-in")
    }

    // Only admins should access this page
    if (orgRole !== "org:admin") {
        redirect("/dashboard")
    }

    const token = await getAuthToken()

    // Get organization data
    const organization = await fetchQuery(api.organizations.getOrganization, { orgId }, { token })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Alert Management</h1>
            <p className="text-muted-foreground">Configure and manage real-time alerts for your business</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AlertSettings organizationId={orgId} />
                <AlertList organizationId={orgId} />
            </div>
        </div>
    )
}

