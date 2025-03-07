"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltipContent, ChartTooltip } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, TrendingUp, AlertCircle } from "lucide-react"

interface CustomerSentimentProps {
    organizationId: string
    feedbackData: any[] // Will contain customer feedback data
}

export default function CustomerSentiment({ organizationId, feedbackData }: CustomerSentimentProps) {
    const [timePeriod, setTimePeriod] = useState("month")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [sentimentData, setSentimentData] = useState<any>(null)

    // Get feedback data from Convex
    const customerFeedback = useQuery(api.analytics.getCustomerFeedback, {
        organizationId,
        period: timePeriod,
    })

    // Colors for sentiment categories
    const colors = {
        positive: "#4ade80", // green
        neutral: "#94a3b8", // slate
        negative: "#f87171", // red
    }

    // Handle sentiment analysis
    const analyzeSentiment = async () => {
        setIsAnalyzing(true)
        try {
            // This would call your API endpoint that uses AI SDK
            const response = await fetch("/api/analytics/sentiment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    organizationId,
                    feedbackData: customerFeedback || [],
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to analyze sentiment")
            }

            const result = await response.json()
            setSentimentData(result)
        } catch (error) {
            console.error("Error analyzing sentiment:", error)
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Example visualization of sentiment data
    const renderSentimentChart = () => {
        if (!sentimentData) return null

        const chartData = [
            { name: "Positive", value: sentimentData.positive, color: colors.positive },
            { name: "Neutral", value: sentimentData.neutral, color: colors.neutral },
            { name: "Negative", value: sentimentData.negative, color: colors.negative },
        ]

        return (
            <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Customer Sentiment Distribution</h3>
                <ChartContainer className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" name="Count">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                {sentimentData.topKeywords && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">Common Themes</h3>
                        <div className="flex flex-wrap gap-2">
                            {sentimentData.topKeywords.map((keyword: string, index: number) => (
                                <span key={index} className="bg-muted px-3 py-1 rounded-full text-sm">
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {sentimentData.suggestedActions && (
                    <div className="mt-6 bg-primary/5 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                            <AlertCircle className="mr-2 h-5 w-5 text-primary" />
                            Recommended Actions
                        </h3>
                        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                            {sentimentData.suggestedActions.map((action: string, index: number) => (
                                <li key={index}>{action}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                    Customer Feedback Analysis
                </CardTitle>
                <CardDescription>Analyze customer reviews and feedback to identify patterns and sentiment.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-1">
                        <Select value={timePeriod} onValueChange={setTimePeriod}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select time period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Last Week</SelectItem>
                                <SelectItem value="month">Last Month</SelectItem>
                                <SelectItem value="quarter">Last Quarter</SelectItem>
                                <SelectItem value="year">Last Year</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={analyzeSentiment} disabled={isAnalyzing || !customerFeedback?.length}>
                        {isAnalyzing ? (
                            <>
                                <TrendingUp className="mr-2 h-4 w-4 animate-pulse" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Analyze Feedback
                            </>
                        )}
                    </Button>
                </div>

                {!customerFeedback ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : customerFeedback.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-20" />
                        <p>No customer feedback available for this time period.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <div className="text-sm text-muted-foreground mb-2">
                                {customerFeedback.length} customer feedback entries available for analysis
                            </div>

                            {sentimentData ? (
                                renderSentimentChart()
                            ) : (
                                <div className="bg-primary/5 p-4 rounded-lg mt-4">
                                    <p className="text-center">
                                        Click "Analyze Feedback" to process customer feedback data and generate insights.
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

