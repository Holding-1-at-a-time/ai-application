import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, DollarSign, CheckCircle, XCircle } from "lucide-react"

interface ServicePerformanceProps {
    metrics: any
}

export default function ServicePerformance({ metrics }: ServicePerformanceProps) {
    // Sort services by revenue (highest first)
    const sortedServices = [...metrics.serviceMetrics].sort((a, b) => b.revenue - a.revenue)

    return (
        <div className="space-y-6">
            {/* Period Info */}
            <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center mb-2">
                    <BarChart className="mr-2 h-4 w-4 text-primary" />
                    Service Performance
                </h3>
                <p className="text-sm text-muted-foreground">
                    Analysis period: {metrics.startDate} to {metrics.endDate}
                </p>
            </div>

            {/* Revenue by Service */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Revenue by Service</h3>
                <div className="relative">
                    {/* Revenue Chart */}
                    <div className="h-64 mb-4 relative">
                        <div className="absolute inset-0 flex items-end">
                            {sortedServices.map((service: any, index: number) => {
                                // Calculate max revenue for scaling
                                const maxRevenue = Math.max(...sortedServices.map((s: any) => s.revenue))
                                const height = maxRevenue > 0 ? (service.revenue / maxRevenue) * 100 : 0

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div className="w-full mx-1 rounded-t bg-primary" style={{ height: `${height}%` }}>
                                            <div className="w-full h-full relative group">
                                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 mb-1 transition-opacity">
                                                    ${service.revenue.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="text-xs mt-1 text-muted-foreground truncate w-full text-center"
                                            title={service.serviceName}
                                        >
                                            {service.serviceName.length > 10
                                                ? `${service.serviceName.substring(0, 10)}...`
                                                : service.serviceName}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Metrics Table */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Service Metrics</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2 px-3">Service</th>
                                <th className="text-center py-2 px-3">Bookings</th>
                                <th className="text-center py-2 px-3">Completed</th>
                                <th className="text-center py-2 px-3">Cancelled</th>
                                <th className="text-center py-2 px-3">Completion Rate</th>
                                <th className="text-right py-2 px-3">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedServices.map((service: any, index: number) => (
                                <tr key={index} className="border-b">
                                    <td className="py-2 px-3 font-medium">{service.serviceName}</td>
                                    <td className="py-2 px-3 text-center">{service.totalBookings}</td>
                                    <td className="py-2 px-3 text-center">
                                        <div className="flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                            {service.completedBookings}
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        <div className="flex items-center justify-center">
                                            <XCircle className="h-4 w-4 mr-1 text-red-500" />
                                            {service.cancelledBookings}
                                        </div>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                        <Badge variant={getCompletionRateVariant(service.completionRate)}>
                                            {service.completionRate.toFixed(0)}%
                                        </Badge>
                                    </td>
                                    <td className="py-2 px-3 text-right font-bold">
                                        <div className="flex items-center justify-end">
                                            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                                            {service.revenue.toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Key Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <div className="bg-primary/20 p-2 rounded-full mr-3">
                                <DollarSign className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Top Revenue Generator</h4>
                                <p className="text-sm text-muted-foreground">
                                    {sortedServices.length > 0 ? sortedServices[0].serviceName : "No data"} is your highest
                                    revenue-generating service.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-primary/20 p-2 rounded-full mr-3">
                                <CheckCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Highest Completion Rate</h4>
                                <p className="text-sm text-muted-foreground">
                                    {sortedServices.length > 0
                                        ? sortedServices.sort((a, b) => b.completionRate - a.completionRate)[0].serviceName
                                        : "No data"}{" "}
                                    has the highest completion rate.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-primary/20 p-2 rounded-full mr-3">
                                <XCircle className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Highest Cancellation Rate</h4>
                                <p className="text-sm text-muted-foreground">
                                    {sortedServices.length > 0
                                        ? sortedServices
                                            .filter((s) => s.totalBookings > 0)
                                            .sort(
                                                (a, b) => b.cancelledBookings / b.totalBookings - a.cancelledBookings / a.totalBookings,
                                            )[0]?.serviceName
                                        : "No data"}{" "}
                                    has the highest cancellation rate.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Helper function for styling
function getCompletionRateVariant(rate: number) {
    if (rate >= 90) return "default"
    if (rate >= 75) return "secondary"
    if (rate >= 50) return "outline"
    return "destructive"
}

