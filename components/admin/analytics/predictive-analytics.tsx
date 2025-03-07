"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp } from "lucide-react"

interface PredictiveAnalyticsProps {
    organizationId: string
}

export default function PredictiveAnalytics({ organizationId }: PredictiveAnalyticsProps) {
    const [predictionType, setPredictionType] = useState("customer_retention")
    const [predictionPeriod, setPredictionPeriod] = useState("3")
    const [isLoading, setIsLoading] = useState(false)
    const [predictionData, setPredictionData] = useState<any>(null)

    // Get historical data from Convex
    const historicalData = useQuery(api.analytics.getHistoricalCustomerData, {
        organizationId,
    })

    // Handle generating predictions
    const generatePredictions = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/analytics/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    organizationId,
                    predictionType,
                    predictionPeriod: Number(predictionPeriod),
                    historicalData: historicalData || [],
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to generate predictions")
            }

            const result = await response.json()
            setPredictionData(result)
        } catch (error) {
            console.error("Error generating predictions:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                    Predictive Analytics
                </CardTitle>
                <CardDescription>Generate AI-powered predictions for customer behavior and business outcomes.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                        <Select value={predictionType} onValueChange={setPredictionType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select prediction type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="customer_retention">Customer Retention</SelectItem>
                                <SelectItem value="service_demand">Service Demand</SelectItem>
                                <SelectItem value="revenue_forecast">Revenue Forecast</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-40">
                        <Select value={predictionPeriod} onValueChange={setPredictionPeriod}>
                            <SelectTrigger>
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3 Months</SelectItem>
                                <SelectItem value="6">6 Months</SelectItem>
                                <SelectItem value="12">12 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={generatePredictions} disabled={isLoading || !historicalData}>
                        {isLoading ? (
                            <>
                                <TrendingUp className="mr-2 h-4 w-4 animate-pulse" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </div>

                {!historicalData ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : (
                    <>
                        {predictionData ? (
                            <div className="mt-6">
                                <h3 className="text-lg font-medium mb-4">
                                    {predictionType === "customer_retention" && "Customer Retention Prediction"}
                                    {predictionType === "service_demand" && "Service Demand Prediction"}
                                    {predictionType === "revenue_forecast" && "Revenue Forecast"}
                                </h3>
                                <ChartContainer className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={predictionData.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Legend />
                                            <Line type="monotone" dataKey="historical" stroke="#8884d8" name="Historical" strokeWidth={2} />
                                            <Line
                                                type="monotone"
                                                dataKey="predicted"
                                                stroke="#82ca9d"
                                                name="Predicted"
                                                strokeWidth={2}
                                                strokeDasharray="5 5"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </ChartContainer>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">Key Insights</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            {predictionData.insights.map((insight: string, index: number) => (
                                                <li key={index}>{insight}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-primary/5 p-4 rounded-lg">
                                        <h4 className="font-medium mb-2">Recommended Actions</h4>
                                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                            {predictionData.recommendations.map((rec: string, index: number) => (
                                                <li key={index}>{rec}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-primary/5 p-4 rounded-lg mt-4">
                                <p className="text-center">
                                    Select prediction type and period, then click "Generate" to create AI-powered forecasts.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

