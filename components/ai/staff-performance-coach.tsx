"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, User, TrendingUp, Award, Clock, ThumbsUp, MessageSquare, FileText, Send } from "lucide-react"

interface StaffPerformanceCoachProps {
    organizationId: string
}

export default function StaffPerformanceCoach({ organizationId }: StaffPerformanceCoachProps) {
    const [activeTab, setActiveTab] = useState("overview")
    const [selectedDetailer, setSelectedDetailer] = useState<string | null>(null)
    const [feedbackMode, setFeedbackMode] = useState(false)

    // Get detailers data
    const detailers = useQuery(api.detailers.getDetailersWithPerformance, { organizationId })

    // Get selected detailer data
    const detailerData = useQuery(
        api.detailers.getDetailerPerformanceData,
        selectedDetailer ? { detailerId: selectedDetailer } : "skip",
    )

    // Setup AI chat for coaching
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/ai/staff-coaching",
        body: {
            detailerId: selectedDetailer,
            detailerData,
            organizationId,
        },
    })

    // Get the latest assistant message
    const coachingData = messages.filter((m) => m.role === "assistant").pop()?.content
        ? JSON.parse(messages.filter((m) => m.role === "assistant").pop()?.content || "{}")
        : null

    // Generate coaching insights
    const generateCoachingInsights = () => {
        if (selectedDetailer && detailerData) {
            handleSubmit({ preventDefault: () => { } } as any)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-primary" />
                    Staff Performance Coach
                </CardTitle>
                <CardDescription className="flex justify-between items-center">
                    <span>AI-powered performance analysis and coaching for your detailing staff</span>
                    {detailers && (
                        <Select value={selectedDetailer || ""} onValueChange={setSelectedDetailer}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select detailer" />
                            </SelectTrigger>
                            <SelectContent>
                                {detailers.map((detailer) => (
                                    <SelectItem key={detailer._id} value={detailer._id}>
                                        {detailer.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!selectedDetailer ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground text-center">
                            Select a detailer to view performance analysis and coaching insights
                        </p>
                    </div>
                ) : !coachingData ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <User className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground text-center mb-4">
                            Ready to analyze performance data for this detailer
                        </p>
                        <Button onClick={generateCoachingInsights} disabled={isLoading || !detailerData}>
                            {isLoading ? (
                                <>
                                    <TrendingUp className="mr-2 h-4 w-4 animate-pulse" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Generate Coaching Insights
                                </>
                            )}
                        </Button>
                    </div>
                ) : feedbackMode ? (
                    <div className="space-y-4">
                        <div className="border rounded-lg p-4 bg-muted/20">
                            <h3 className="font-medium mb-2">Coaching Feedback</h3>
                            <div className="space-y-4">
                                {messages.map((message, index) => (
                                    <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                        <div
                                            className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                                }`}
                                        >
                                            <div className="text-sm whitespace-pre-wrap">
                                                {message.role === "assistant" && message.content.startsWith("{")
                                                    ? "Here's my analysis of the detailer's performance. Let me know if you have any questions or need specific coaching advice."
                                                    : message.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} className="mt-4">
                                <div className="flex gap-2">
                                    <input
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={input}
                                        onChange={handleInputChange}
                                        placeholder="Ask about specific coaching strategies..."
                                    />
                                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>

                        <Button variant="outline" onClick={() => setFeedbackMode(false)}>
                            Back to Performance Overview
                        </Button>
                    </div>
                ) : (
                    <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="overview">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="metrics">
                                <Award className="mr-2 h-4 w-4" />
                                Metrics
                            </TabsTrigger>
                            <TabsTrigger value="coaching">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Coaching
                            </TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-lg">{coachingData.detailerName}</h3>
                                    <p className="text-sm text-muted-foreground">{coachingData.role}</p>
                                    <div className="flex gap-2 mt-1">
                                        <Badge variant="outline">{coachingData.experienceLevel}</Badge>
                                        <Badge variant={coachingData.performanceLevel === "Excellent" ? "success" : "secondary"}>
                                            {coachingData.performanceLevel}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border rounded-lg p-3">
                                    <div className="flex items-center mb-2">
                                        <Clock className="h-4 w-4 text-primary mr-2" />
                                        <h3 className="font-medium">Efficiency</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span>Score</span>
                                            <span className="font-medium">{coachingData.metrics.efficiency.score}/10</span>
                                        </div>
                                        <Progress value={coachingData.metrics.efficiency.score * 10} />
                                        <p className="text-xs text-muted-foreground">{coachingData.metrics.efficiency.summary}</p>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-3">
                                    <div className="flex items-center mb-2">
                                        <ThumbsUp className="h-4 w-4 text-primary mr-2" />
                                        <h3 className="font-medium">Quality</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span>Score</span>
                                            <span className="font-medium">{coachingData.metrics.quality.score}/10</span>
                                        </div>
                                        <Progress value={coachingData.metrics.quality.score * 10} />
                                        <p className="text-xs text-muted-foreground">{coachingData.metrics.quality.summary}</p>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-3">
                                    <div className="flex items-center mb-2">
                                        <Users className="h-4 w-4 text-primary mr-2" />
                                        <h3 className="font-medium">Customer Satisfaction</h3>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span>Score</span>
                                            <span className="font-medium">{coachingData.metrics.customerSatisfaction.score}/10</span>
                                        </div>
                                        <Progress value={coachingData.metrics.customerSatisfaction.score * 10} />
                                        <p className="text-xs text-muted-foreground">{coachingData.metrics.customerSatisfaction.summary}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h3 className="font-medium mb-2">Performance Summary</h3>
                                <p className="text-sm">{coachingData.summary}</p>
                            </div>
                        </TabsContent>

                        {/* Metrics Tab */}
                        <TabsContent value="metrics" className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <h3 className="font-medium mb-3">Performance Metrics</h3>
                                <div className="space-y-4">
                                    {coachingData.detailedMetrics.map((metric: any, index: number) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-medium">{metric.name}</h4>
                                                <div className="flex items-center">
                                                    <span className="text-sm font-medium mr-2">{metric.value}</span>
                                                    <Badge
                                                        variant={
                                                            metric.trend === "up" ? "success" : metric.trend === "down" ? "destructive" : "secondary"
                                                        }
                                                    >
                                                        {metric.trend === "up" ? "↑" : metric.trend === "down" ? "↓" : "→"}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Progress value={metric.percentile} />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Team Avg: {metric.teamAverage}</span>
                                                <span>Percentile: {metric.percentile}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">Strengths</h3>
                                    <ul className="space-y-2">
                                        {coachingData.strengths.map((strength: string, index: number) => (
                                            <li key={index} className="flex items-start">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2 mt-1.5"></span>
                                                <span className="text-sm">{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border rounded-lg p-4">
                                    <h3 className="font-medium mb-2">Areas for Improvement</h3>
                                    <ul className="space-y-2">
                                        {coachingData.areasForImprovement.map((area: string, index: number) => (
                                            <li key={index} className="flex items-start">
                                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 mr-2 mt-1.5"></span>
                                                <span className="text-sm">{area}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Coaching Tab */}
                        <TabsContent value="coaching" className="space-y-4">
                            <div className="border rounded-lg p-4">
                                <h3 className="font-medium mb-2">Coaching Recommendations</h3>
                                <div className="space-y-3">
                                    {coachingData.coachingRecommendations.map((rec: any, index: number) => (
                                        <div key={index} className="border-l-2 border-primary pl-3 py-1">
                                            <h4 className="text-sm font-medium">{rec.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                                            <div className="mt-2">
                                                <Badge variant="outline">{rec.priority} Priority</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border rounded-lg p-4">
                                <h3 className="font-medium mb-2">Development Plan</h3>
                                <div className="space-y-3">
                                    {coachingData.developmentPlan.map((item: any, index: number) => (
                                        <div key={index} className="flex items-start">
                                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-2 mt-0.5">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium">{item.goal}</h4>
                                                <p className="text-sm text-muted-foreground mt-0.5">{item.action}</p>
                                                <p className="text-xs text-muted-foreground mt-1">Timeframe: {item.timeframe}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Button onClick={() => setFeedbackMode(true)}>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Interactive Coaching Session
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                {selectedDetailer && coachingData && (
                    <>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedDetailer(null)}>
                            Select Different Detailer
                        </Button>
                        <Button variant="outline" size="sm">
                            <FileText className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                    </>
                )}
            </CardFooter>
        </Card>
    )
}

