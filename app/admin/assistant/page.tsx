import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { getAuthToken } from "@/lib/auth"
import BusinessAssistant from "@/components/admin/assistant/business-assistant"

export default async function AdminAssistantPage() {
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
            <h1 className="text-3xl font-bold">Business Intelligence Assistant</h1>
            <p className="text-muted-foreground">
                Ask questions about your business data and get AI-powered insights and recommendations
            </p>

            <BusinessAssistant organizationId={orgId} />
        </div>
    )
}

