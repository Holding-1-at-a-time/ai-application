"use client"

import { useState } from "react"
import { useAction, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Globe, MessageSquare, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"

interface MultilingualSentimentProps {
    organizationId: string
}

export default function MultilingualSentiment({ organizationId }: MultilingualSentimentProps) {
    const [feedback, setFeedback] = useState("")
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [activeTab, setActiveTab] = useState("analyze")

    // Get recent sentiment analyses
    const sentimentAnalyses = useQuery(api.nlp.getRecentSentimentAnalyses, {
        organizationId,
        limit: 10,
    })

    // Process feedback action
    const processFeedback = useAction(api.nlp.processFeedbackMultilingual)

    // Handle feedback analysis
    const handleAnalyzeFeedback = async () => {
        if (!feedback.trim()) {
            toast({
                title: "Please enter feedback",
                description: "Feedback text is required for analysis.",
                variant: "destructive",
            })
            return
        }

        setIsAnalyzing(true)
        try {
            await processFeedback({
                organizationId,
                feedback,
            })

            toast({
                title: "Feedback analyzed",
                description: "The feedback has been successfully analyzed.",
            })

            setFeedback("")
            setActiveTab("results")
        } catch (error) {
            console.error("Error analyzing feedback:", error)
            toast({
                title: "Analysis failed",
                description: "Failed to analyze feedback. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Get sentiment color
    const getSentimentColor = (score: number) => {
        if (score > 0.5) return "text-green-500"
        if (score > 0 && score <= 0.5) return "text-blue-500"
        if (score === 0) return "text-gray-500"
        if (score >= -0.5) return "text-yellow-500"
        return "text-red-500"
    }

    // Get sentiment badge variant
    const getSentimentBadge = (label: string) => {
        switch (label.toLowerCase()) {
            case "positive":
                return "success"
            case "neutral":
                return "secondary"
            case "negative":
                return "destructive"
            default:
                return "outline"
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-primary" />
                    Multilingual Feedback Analysis
                </CardTitle>
                <CardDescription>Analyze customer feedback in any language</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="analyze" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="analyze">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Analyze
                        </TabsTrigger>
                        <TabsTrigger value="results">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Results
                        </TabsTrigger>
                    </TabsList>

                    {/* Analyze Tab */}
                    <TabsContent value="analyze" className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="feedback">Customer Feedback (any language)</Label>
                                <Textarea
                                    id="feedback"
                                    placeholder="Enter customer feedback in any language"
                                    className="h-32 mt-2"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                />
                            </div>

                            <Button onClick={handleAnalyzeFeedback} disabled={isAnalyzing || !feedback.trim()} className="w-full">
                                {isAnalyzing ? (
                                    <>
                                        <Globe className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight className="mr-2 h-4 w-4" />
                                        Analyze Feedback
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Results Tab */}
                    <TabsContent value="results" className="space-y-4">
                        {!sentimentAnalyses ? (
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-20 w-full" />
                                <Skeleton className="h-20 w-full" />
                            </div>
                        ) : sentimentAnalyses.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                <p>No sentiment analyses available yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {sentimentAnalyses.map((analysis) => (
                                    <div key={analysis._id} className="border rounded-lg overflow-hidden">
                                        <div className="flex items-center justify-between p-4 bg-muted/40">
                                            <div className="flex items-center">
                                                <Globe className="mr-2 h-4 w-4 text-primary" />
                                                <span>
                                                    {analysis.language.detected} ({analysis.language.code})
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={getSentimentBadge(analysis.sentiment.label)}>{analysis.sentiment.label}</Badge>
                                                <Badge variant="outline">{analysis.sentiment.score.toFixed(2)}</Badge>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-4">
                                            {/* Original feedback */}
                                            <div>
                                                <h4 className="text-sm font-medium mb-1">Original Feedback:</h4>
                                                <p className="text-sm bg-muted/20 p-2 rounded-md">{analysis.feedback}</p>
                                            </div>

                                            {/* Translation if available */}
                                            {analysis.translation.isTranslated && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-1">English Translation:</h4>
                                                    <p className="text-sm bg-muted/20 p-2 rounded-md">{analysis.translation.english}</p>
                                                </div>
                                            )}

                                            {/* Topics */}
                                            {analysis.topics.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Topic Sentiment:</h4>
                                                    <div className="space-y-2">
                                                        {analysis.topics.map((topic, index) => (
                                                            <div key={index} className="flex justify-between items-center">
                                                                <span className="text-sm">{topic.name}</span>
                                                                <span className={`text-sm font-medium ${getSentimentColor(topic.sentiment)}`}>
                                                                    {topic.sentiment.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Key points */}
                                            {analysis.keyPoints.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium mb-2">Key Points:</h4>
                                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                                        {analysis.keyPoints.map((point, index) => (
                                                            <li key={index}>{point}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {/* Actionable feedback */}
                                            <div className="bg-primary/5 p-3 rounded-lg flex items-start">
                                                {analysis.actionableFeedback ? (
                                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                                                ) : (
                                                    <AlertCircle className="mr-2 h-4 w-4 text-yellow-500 mt-0.5" />
                                                )}
                                                <p className="text-sm">
                                                    {analysis.actionableFeedback
                                                        ? "This feedback contains actionable information."
                                                        : "This feedback doesn't contain specific actionable information."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}