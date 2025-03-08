import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { getAuthToken } from "@/lib/auth"
import ExecutiveReportGenerator from "@/components/admin/reports/executive-report-generator"

export default async function AdminReportsPage() {
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

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Executive Reports</h1>
            <p className="text-muted-foreground">Generate comprehensive business reports with insights and recommendations</p>

            <ExecutiveReportGenerator organizationId={orgId} />
        </div>
    )
}

