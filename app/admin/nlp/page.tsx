import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { getAuthToken } from "@/lib/auth"
import EntityVisualization from "@/components/admin/nlp/entity-visualization"
import MultilingualSentiment from "@/components/admin/nlp/multilingual-sentiment"

export default async function AdminNLPPage() {
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
            <h1 className="text-3xl font-bold">Natural Language Processing</h1>
            <p className="text-muted-foreground">
                Advanced language processing tools for analyzing customer feedback and communications
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EntityVisualization organizationId={orgId} />
                <MultilingualSentiment organizationId={orgId} />
            </div>
        </div>
    )
}

