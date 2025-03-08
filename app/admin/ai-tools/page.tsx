import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { getAuthToken } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ServiceRecommender from "@/components/ai/service-recommender"
import CustomerInsights from "@/components/ai/customer-insights"
import VehicleInspection from "@/components/ai/vehicle-inspection"
import PricingOptimizer from "@/components/ai/pricing-optimizer"
import StaffPerformanceCoach from "@/components/ai/staff-performance-coach"
import InventoryOptimizer from "@/components/ai/inventory-optimizer"

export default async function AdminAIToolsPage() {
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
            <h1 className="text-3xl font-bold">AI Tools Dashboard</h1>
            <p className="text-muted-foreground">Advanced AI-powered tools to optimize your auto detailing business</p>

            <Tabs defaultValue="service" className="space-y-6">
                <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto">
                    <TabsTrigger value="service">Service</TabsTrigger>
                    <TabsTrigger value="customer">Customer</TabsTrigger>
                    <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                </TabsList>

                <TabsContent value="service">
                    <ServiceRecommender organizationId={orgId} />
                </TabsContent>

                <TabsContent value="customer">
                    <CustomerInsights organizationId={orgId} />
                </TabsContent>

                <TabsContent value="vehicle">
                    <VehicleInspection />
                </TabsContent>

                <TabsContent value="pricing">
                    <PricingOptimizer organizationId={orgId} />
                </TabsContent>

                <TabsContent value="staff">
                    <StaffPerformanceCoach organizationId={orgId} />
                </TabsContent>

                <TabsContent value="inventory">
                    <InventoryOptimizer organizationId={orgId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

