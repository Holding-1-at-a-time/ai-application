"use client"

import { useState } from "react"
import { useObject } from "@ai-sdk/react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, PieChart, Users, TrendingUp, RefreshCw, Lightbulb } from "lucide-react"

interface CustomerInsightsProps {
    organizationId: string
},
interface KeyMetric {
    name: string;
    change: number;
    value: string; // Or number, depending on your data
    description: string;
}

export default function CustomerInsights({ organizationId }: CustomerInsightsProps) {
    const [activeTab, setActiveTab] = useState("overview")

    // Get customer data
    const customerData = useQuery(api.customers.getCustomersForAnalysis, { organizationId })

    // Get appointment data
    const appointmentData = useQuery(api.appointments.getAppointmentsForAnalysis, { organizationId })
    const [, setError] = useState<string | null>(null)
    const { object, submit, isLoading } = useObject({
        api: "/api/ai/customer-insights",
        initialObject: null,
        body: {
            organizationId,
            customerData,
            appointmentData,
        },
        onSuccess: (results: unknown) => {
            console.log(`Customer Insights: ${JSON.stringify(results)}`)
        },
        onError: (error) => {
            if (error && error.message) {
                setError(error.message)
                console.error("Customer Insights:", error)
            } else {
                setError("An unknown error occurred.")
                console.error("Customer Insights: An unknown error occurred.", error)
            }
        },
    })

    // Generate insights when data is available
    const generateInsights = () => {
        if (customerData && appointmentData) {
            submit()
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    Customer Insights
                </CardTitle>
                <CardDescription className="flex justify-between items-center">
                    <span>AI-generated insights about your customer base</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={generateInsights}
                        disabled={isLoading || !customerData || !appointmentData}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        {isLoading ? "Analyzing..." : "Refresh Insights"}
                    </Button>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="overview">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="segments">
                            <PieChart className="mr-2 h-4 w-4" />
                            Segments
                        </TabsTrigger>
                        <TabsTrigger value="trends">
                            <BarChart className="mr-2 h-4 w-4" />
                            Trends
                        </TabsTrigger>
                        <TabsTrigger value="recommendations">
                            <Lightbulb className="mr-2 h-4 w-4" />
                            Actions
                        </TabsTrigger>
                    </TabsList>

                    {!object ? (
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    ) : (
                        <>
                            {/* Overview Tab */}
                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {object.keyMetrics.map((metric: any, index: number) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm font-medium text-muted-foreground">{metric.name}</h3>
                                                <span
                                                    className={`text-xs ${metric.change > 0 ? "text-green-500" : metric.change < 0 ? "text-red-500" : "text-gray-500"}`}
                                                >
                                                    {metric.change > 0 ? "+" : ""}
                                                    {metric.change}%
                                                </span>
                                            </div>
                                            <p className="text-2xl font-bold mt-2">{metric.value}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">Key Insights</h3>
                                    <ul className="space-y-2">
                                        {object.keyInsights.map((insight: string, index: number) => (
                                            <li key={index} className="flex items-start">
                                                <Lightbulb className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm">{insight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </TabsContent>

                            {/* Segments Tab */}
                            <TabsContent value="segments" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {object.customerSegments.map((segment: any, index: number) => (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-medium">{segment.name}</h3>
                                                <span className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                    {segment.percentage}%
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">{segment.description}</p>
                                            <div className="mt-3">
                                                <h4 className="text-xs font-medium mb-1">Key Characteristics:</h4>
                                                <ul className="text-xs space-y-1">
                                                    {segment.characteristics.map((char: string, idx: number) => (
                                                        <li key={idx} className="flex items-center">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></span>
                                                            {char}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Trends Tab */}
                            <TabsContent value="trends" className="space-y-4">
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-3">Customer Behavior Trends</h3>
                                    <div className="space-y-3">
                                        {object.trends.map((trend: any, index: number) => (
                                            <div key={index} className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="text-sm font-medium">{trend.name}</h4>
                                                    <span
                                                        className={`text-xs ${trend.direction === "up" ? "text-green-500" : trend.direction === "down" ? "text-red-500" : "text-gray-500"}`}
                                                    >
                                                        {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"} {trend.value}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-2">
                                                    <div className="bg-primary rounded-full h-2" style={{ width: `${trend.strength}%` }}></div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{trend.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* Recommendations Tab */}
                            <TabsContent value="recommendations" className="space-y-4">
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-3">Recommended Actions</h3>
                                    <div className="space-y-4">
                                        {object.recommendations.map((rec: any, index: number) => (
                                            <div key={index} className="border-l-2 border-primary pl-3 py-1">
                                                <h4 className="text-sm font-medium">{rec.title}</h4>
                                                <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                                                <div className="flex items-center mt-2">
                                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-2">
                                                        {rec.impact} Impact
                                                    </span>
                                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{rec.effort} Effort</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </CardContent>
        </Card>
    )
}