"use client"

import { useState } from "react"
import { useAction, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Sparkles, TrendingUp, Calendar, Wrench, MessageSquare, Camera } from "lucide-react"
import BusinessInsights from "./business-insights"
import RevenueForecast from "./revenue-forecast"
import ServicePerformance from "./service-performance"
import BookingPatterns from "./booking-patterns"
import CustomerSentiment from "./customer-sentiment"
import PredictiveAnalytics from "./predictive-analytics"
import ImageAnalysis from "./image-analysis"

interface AIDashboardProps {
    organization: any
    metrics: any
    appointments: any[]
    services: any[]
    organizationId: string
}

export default function AIDashboard({
    organization,
    metrics,
    appointments,
    services,
    organizationId,
}: AIDashboardProps) {
    const [activeTab, setActiveTab] = useState("insights")
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
    const [isGeneratingForecast, setIsGeneratingForecast] = useState(false)
    const [analysisType, setAnalysisType] = useState("general")
    const [forecastPeriod, setForecastPeriod] = useState("6")
    const [timePeriod, setTimePeriod] = useState("month")

    // Get service performance metrics
    const serviceMetrics = useQuery(api.analytics.getServicePerformanceMetrics, {
        organizationId,
        period: timePeriod,
    })

    // Actions for generating insights and forecasts
    const generateBusinessInsights = useAction(api.analytics.generateBusinessInsights)
    const generateRevenueForecast = useAction(api.analytics.generateRevenueForecast)

    // State for storing AI-generated insights and forecasts
    const [insights, setInsights] = useState<any>(null)
    const [forecast, setForecast] = useState<any>(null)

    // Handle generating business insights
    const handleGenerateInsights = async () => {
        setIsGeneratingInsights(true)

        try {
            // Prepare appointment data for AI analysis
            const appointmentsData = appointments.map((app) => ({
                date: app.date,
                time: app.time,
                status: app.status,
                serviceName: app.serviceName,
                servicePrice: app.servicePrice,
                serviceDuration: app.serviceDuration,
                serviceCategory: app.serviceCategory,
            }))

            // Generate insights using AI
            const result = await generateBusinessInsights({
                organizationId,
                appointmentsData,
                metricsData: metrics,
                analysisType,
            })

            setInsights(result)

            toast({
                title: "Insights generated",
                description: "AI business insights have been successfully generated.",
            })
        } catch (error) {
            console.error("Error generating insights:", error)
            toast({
                title: "Error",
                description: "Failed to generate business insights. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsGeneratingInsights(false)
        }
    }

    // Handle generating revenue forecast
    const handleGenerateForecast = async () => {
        setIsGeneratingForecast(true)

        try {
            // Prepare historical revenue data
            // Group appointments by month and calculate revenue
            const revenueByMonth: Record<string, number> = {}

            appointments.forEach((app) => {
                if (app.status === "completed") {
                    const month = app.date.substring(0, 7) // YYYY-MM
                    revenueByMonth[month] = (revenueByMonth[month] || 0) + app.servicePrice
                }
            })

            const historicalData = Object.entries(revenueByMonth)
                .map(([month, revenue]) => ({
                    date: `${month}-01`, // First day of month
                    revenue,
                }))
                .sort((a, b) => a.date.localeCompare(b.date))

            // Generate forecast using AI
            const result = await generateRevenueForecast({
                organizationId,
                historicalData,
                forecastPeriod: Number.parseInt(forecastPeriod),
            })

            setForecast(result)

            toast({
                title: "Forecast generated",
                description: `Revenue forecast for the next ${forecastPeriod} months has been generated.`,
            })
        } catch (error) {
            console.error("Error generating forecast:", error)
            toast({
                title: "Error",
                description: "Failed to generate revenue forecast. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsGeneratingForecast(false)
        }
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="insights" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-7 mb-4">
                    <TabsTrigger value="insights">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Business Insights
                    </TabsTrigger>
                    <TabsTrigger value="forecast">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Revenue Forecast
                    </TabsTrigger>
                    <TabsTrigger value="services">
                        <Wrench className="mr-2 h-4 w-4" />
                        Service Performance
                    </TabsTrigger>
                    <TabsTrigger value="bookings">
                        <Calendar className="mr-2 h-4 w-4" />
                        Booking Patterns
                    </TabsTrigger>
                    <TabsTrigger value="sentiment">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Customer Sentiment
                    </TabsTrigger>
                    <TabsTrigger value="predictive">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Predictive Analytics
                    </TabsTrigger>
                    <TabsTrigger value="images">
                        <Camera className="mr-2 h-4 w-4" />
                        Image Analysis
                    </TabsTrigger>
                </TabsList>

                {/* Business Insights Tab */}
                <TabsContent value="insights" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                                AI Business Insights
                            </CardTitle>
                            <CardDescription>Generate AI-powered insights to help optimize your business operations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex-1">
                                    <Select value={analysisType} onValueChange={setAnalysisType}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select analysis type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General Business Analysis</SelectItem>
                                            <SelectItem value="scheduling">Scheduling Optimization</SelectItem>
                                            <SelectItem value="services">Service Performance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleGenerateInsights} disabled={isGeneratingInsights}>
                                    {isGeneratingInsights ? (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Insights
                                        </>
                                    )}
                                </Button>
                            </div>

                            {isGeneratingInsights ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            ) : insights ? (
                                <BusinessInsights insights={insights} analysisType={analysisType} />
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Sparkles className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                    <p>
                                        Select an analysis type and click "Generate Insights" to get AI-powered business recommendations.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Revenue Forecast Tab */}
                <TabsContent value="forecast" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                                AI Revenue Forecast
                            </CardTitle>
                            <CardDescription>Generate AI-powered revenue forecasts to help with business planning.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex-1">
                                    <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Forecast period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">Next 3 months</SelectItem>
                                            <SelectItem value="6">Next 6 months</SelectItem>
                                            <SelectItem value="12">Next 12 months</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleGenerateForecast} disabled={isGeneratingForecast}>
                                    {isGeneratingForecast ? (
                                        <>
                                            <TrendingUp className="mr-2 h-4 w-4 animate-pulse" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            Generate Forecast
                                        </>
                                    )}
                                </Button>
                            </div>

                            {isGeneratingForecast ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-64 w-full" />
                                </div>
                            ) : forecast ? (
                                <RevenueForecast forecast={forecast} />
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <TrendingUp className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                    <p>Select a forecast period and click "Generate Forecast" to get AI-powered revenue predictions.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Service Performance Tab */}
                <TabsContent value="services" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Wrench className="mr-2 h-5 w-5 text-primary" />
                                Service Performance Analysis
                            </CardTitle>
                            <CardDescription>
                                Analyze the performance of your services to identify opportunities for optimization.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex-1">
                                    <Select value={timePeriod} onValueChange={setTimePeriod}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Time period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="week">Last Week</SelectItem>
                                            <SelectItem value="month">Last Month</SelectItem>
                                            <SelectItem value="quarter">Last Quarter</SelectItem>
                                            <SelectItem value="year">Last Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {!serviceMetrics ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-8 w-3/4" />
                                    <Skeleton className="h-64 w-full" />
                                </div>
                            ) : (
                                <ServicePerformance metrics={serviceMetrics} />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Booking Patterns Tab */}
                <TabsContent value="bookings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Calendar className="mr-2 h-5 w-5 text-primary" />
                                Booking Pattern Analysis
                            </CardTitle>
                            <CardDescription>
                                Analyze booking patterns to optimize scheduling and resource allocation.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BookingPatterns appointments={appointments} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Customer Sentiment Tab */}
                <TabsContent value="sentiment" className="space-y-4">
                    <CustomerSentiment organizationId={organizationId} feedbackData={appointments} />
                </TabsContent>

                {/* Predictive Analytics Tab */}
                <TabsContent value="predictive" className="space-y-4">
                    <PredictiveAnalytics organizationId={organizationId} />
                </TabsContent>

                {/* Image Analysis Tab */}
                <TabsContent value="images" className="space-y-4">
                    <ImageAnalysis organizationId={organizationId} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

