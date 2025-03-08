import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { getAuthToken } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker"
import { Overview } from "@/components/dashboard/overview"
import { RecentAppointments } from "@/components/dashboard/recent-appointments"
import { TopServices } from "@/components/dashboard/top-services"
import { CustomerRetention } from "@/components/dashboard/customer-retention"
import { StaffPerformance } from "@/components/dashboard/staff-performance"
import { InventoryStatus } from "@/components/dashboard/inventory-status"
import { RevenueMetrics } from "@/components/dashboard/revenue-metrics"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { Download, RefreshCw, Filter, Calendar, BarChart3, Users, TrendingUp, Sparkles } from 'lucide-react'

export const metadata = {
    title: "Dashboard | Auto Detailing Analytics",
    description: "Analytics dashboard for your auto detailing business",
}

export default async function DashboardPage() {
    const { userId, orgId, orgRole } = auth()

    if (!userId || !orgId) {
        redirect("/sign-in")
    }

    const token = await getAuthToken()

    // Fetch organization data
    const organization = await fetchQuery(api.organizations.getOrganization, { orgId }, { token })

    // Fetch dashboard metrics
    const metrics = await fetchQuery(api.dashboard.getMetrics, { orgId }, { token })

    // Fetch recent appointments
    const recentAppointments = await fetchQuery(
        api.appointments.getRecentAppointments,
        { organizationId: orgId, limit: 5 },
        { token }
    )

    // Fetch service performance data
    const servicePerformance = await fetchQuery(
        api.analytics.getServicePerformanceMetrics,
        { organizationId: orgId, period: "month" },
        { token }
    )

    // Fetch customer retention data
    const customerRetention = await fetchQuery(
        api.analytics.getCustomerRetentionData,
        { organizationId: orgId },
        { token }
    )

    // Fetch staff performance data
    const staffPerformance = await fetchQuery(
        api.analytics.getStaffPerformanceMetrics,
        { organizationId: orgId },
        { token }
    )

    // Fetch inventory status
    const inventoryStatus = await fetchQuery(
        api.inventory.getInventoryStatus,
        { organizationId: orgId },
        { token }
    )

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <CalendarDateRangePicker />
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button>
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Key Metrics Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.revenueChange > 0 ? "+" : ""}{metrics.revenueChange}% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Appointments</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalAppointments}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.appointmentsChange > 0 ? "+" : ""}{metrics.appointmentsChange}% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.newCustomers}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.newCustomersChange > 0 ? "+" : ""}{metrics.newCustomersChange}% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Service Value</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.averageServiceValue}</div>
                        <p className="text-xs text-muted-foreground">
                            {metrics.avgServiceValueChange > 0 ? "+" : ""}{metrics.avgServiceValueChange}% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="staff">Staff</TabsTrigger>
                    <TabsTrigger value="inventory">Inventory</TabsTrigger>
                    <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Revenue Overview</CardTitle>
                                <CardDescription>
                                    Monthly revenue breakdown for the current year
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <Overview data={metrics.revenueData} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Appointments</CardTitle>
                                <CardDescription>
                                    Your most recent customer appointments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentAppointments data={recentAppointments} />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Top Services</CardTitle>
                                <CardDescription>
                                    Your most popular services by revenue
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TopServices data={servicePerformance} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Customer Retention</CardTitle>
                                <CardDescription>
                                    Customer retention and repeat business metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CustomerRetention data={customerRetention} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Appointments Tab */}
                <TabsContent value="appointments" className="space-y-4">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Appointment Trends</CardTitle>
                            <CardDescription>
                                Appointment volume and completion rates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <Overview data={metrics.appointmentData} />
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appointment Distribution</CardTitle>
                                <CardDescription>
                                    Appointments by day of week and time
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Appointment distribution chart would go here */}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Appointments</CardTitle>
                                <CardDescription>
                                    Your most recent customer appointments
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RecentAppointments data={recentAppointments} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Customers Tab */}
                <TabsContent value="customers" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Retention</CardTitle>
                                <CardDescription>
                                    Customer retention and repeat business metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CustomerRetention data={customerRetention} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Segments</CardTitle>
                                <CardDescription>
                                    Breakdown of your customer base by segment
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Customer segments chart would go here */}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Top Services</CardTitle>
                                <CardDescription>
                                    Your most popular services by revenue
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TopServices data={servicePerformance} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Performance</CardTitle>
                                <CardDescription>
                                    Performance metrics for all services
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Service performance metrics would go here */}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Staff Tab */}
                <TabsContent value="staff" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Staff Performance</CardTitle>
                            <CardDescription>
                                Performance metrics for your detailing staff
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <StaffPerformance data={staffPerformance} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Inventory Tab */}
                <TabsContent value="inventory" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventory Status</CardTitle>
                            <CardDescription>
                                Current inventory levels and usage trends
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <InventoryStatus data={inventoryStatus} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* AI Insights Tab */}
                <TabsContent value="ai-insights" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Sparkles className="mr-2 h-5 w-5 text-primary" />
                                    AI-Generated Business Insights
                                </CardTitle>
                                <CardDescription>
                                    Intelligent analysis of your business data
                                </CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh Insights
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <AIInsights organizationId={orgId} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Revenue Metrics */}
            <Card>
                <CardHeader>
                    <CardTitle>Revenue Metrics</CardTitle>
                    <CardDescription>
                        Detailed breakdown of revenue sources and trends
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <RevenueMetrics data={metrics.revenueMetrics} />
                </CardContent>
            </Card>
        </div>
    )
}

