"use client"

import { useState, useEffect } from "react"
import { useAction } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Lightbulb,
    ThumbsUp,
    Calendar,
    Users,
    DollarSign,
    Car,
} from "lucide-react"

interface AIInsightsProps {
    organizationId: string
}

export function AIInsights({ organizationId }: AIInsightsProps) {
    const [insights, setInsights] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const generateInsights = useAction(api.ai.generateBusinessInsights)

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true)
                const result = await generateInsights({ organizationId })
                setInsights(result)
                setError(null)
            } catch (err) {
                console.error("Error generating insights:", err)
                setError("Failed to generate AI insights. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchInsights()
    }, [organizationId, generateInsights])

    // Function to get icon based on insight type
    const getInsightIcon = (type: string) => {
        switch (type) {
            case "trend_up":
                return <TrendingUp className="h-5 w-5 text-green-500" />
            case "trend_down":
                return <TrendingDown className="h-5 w-5 text-red-500" />
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
            case "opportunity":
                return <Lightbulb className="h-5 w-5 text-blue-500" />
            case "success":
                return <ThumbsUp className="h-5 w-5 text-green-500" />
            case "appointment":
                return <Calendar className="h-5 w-5 text-purple-500" />
            case "customer":
                return <Users className="h-5 w-5 text-indigo-500" />
            case "revenue":
                return <DollarSign className="h-5 w-5 text-emerald-500" />
            case "service":
                return <Car className="h-5 w-5 text-orange-500" />
            default:
                return <Lightbulb className="h-5 w-5 text-primary" />
        }
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {Array(3)
                    .fill(0)
                    .map((_, i) => (
                        <Card key={i}>
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
            </div>
        )
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto mb-4" />
                    <p className="mb-4">{error}</p>
                    <Button onClick={() => { setLoading(true); generateInsights({ organizationId }); }}>Try Again</Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {insights?.insights.map((insight: any, index: number) => (
                <Card key={index}>
                    <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                            <div className="bg-primary/10 p-2 rounded-full">{getInsightIcon(insight.type)}</div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium">{insight.title}</h3>
                                    <Badge
                                        variant={
                                            insight.priority === "high"
                                                ? "destructive"
                                                : insight.priority === "medium"
                                                    ? "default"
                                                    : "secondary"
                                        }
                                    >
                                        {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{insight.description}</p>
                                {insight.recommendation && (
                                    <div className="bg-muted/50 p-2 rounded-md text-sm">
                                        <span className="font-medium">Recommendation:</span> {insight.recommendation}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <div className="text-xs text-muted-foreground text-center">
                AI insights generated on {new Date().toLocaleString()} based on your business data
            </div>
        </div>
    )
}

