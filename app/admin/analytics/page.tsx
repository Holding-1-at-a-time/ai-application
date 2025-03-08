import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { getAuthToken } from "@/lib/auth"
import AIDashboard from "@/components/admin/analytics/ai-dashboard"

export default async function AdminAnalyticsPage() {
    const { userId, orgId, orgRole } = auth()

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

    // Get basic metrics for the dashboard
    const metrics = await fetchQuery(api.dashboard.getMetrics, { orgId }, { token })

    // Get appointments data for analysis
    const appointments = await fetchQuery(api.analytics.getAppointmentsForAnalysis, { organizationId: orgId }, { token })

    // Get services data
    const services = await fetchQuery(api.services.getServices, { organizationId: orgId }, { token })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">AI Business Analytics</h1>
            <p className="text-muted-foreground">
                AI-powered insights and forecasting to help optimize your business operations.
            </p>

            <AIDashboard
                organization={organization}
                metrics={metrics}
                appointments={appointments}
                services={services}
                organizationId={orgId}
            />
        </div>
    )
}

