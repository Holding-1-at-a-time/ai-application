import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Calendar, Wrench } from "lucide-react"

interface BusinessInsightsProps {
    insights: any
    analysisType: string
}

export default function BusinessInsights({ insights, analysisType }: BusinessInsightsProps) {
    // Render different content based on analysis type
    if (analysisType === "general") {
        return (
            <div className="space-y-6">
                {/* Summary */}
                <div className="bg-primary/5 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center mb-2">
                        <Sparkles className="mr-2 h-4 w-4 text-primary" />
                        Business Summary
                    </h3>
                    <p className="text-muted-foreground">{insights.summary}</p>
                </div>

                {/* Trends */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                        <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                        Key Trends
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.trends.map((trend: any, index: number) => (
                            <Card key={index} className="overflow-hidden">
                                <div className={`h-1 ${getImpactColor(trend.impact)}`}></div>
                                <CardHeader className="py-3">
                                    <CardTitle className="text-base flex items-center justify-between">
                                        {trend.name}
                                        <Badge variant="outline">{trend.impact} impact</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="py-2">
                                    <p className="text-sm text-muted-foreground">{trend.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                        <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                        Recommendations
                    </h3>
                    <div className="space-y-3">
                        {insights.recommendations.map((rec: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">{rec.title}</h4>
                                    <Badge variant={getPriorityVariant(rec.priority)}>{rec.priority}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{rec.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Opportunities */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                        <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                        Opportunities
                    </h3>
                    <div className="space-y-3">
                        {insights.opportunities.map((opp: any, index: number) => (
                            <div key={index} className="bg-primary/5 rounded-lg p-3">
                                <h4 className="font-medium mb-1">{opp.title}</h4>
                                <p className="text-sm text-muted-foreground">{opp.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    } else if (analysisType === "scheduling") {
        return (
            <div className="space-y-6">
                {/* Scheduling Patterns */}
                <div className="bg-primary/5 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center mb-2">
                        <Calendar className="mr-2 h-4 w-4 text-primary" />
                        Scheduling Patterns
                    </h3>
                    <p className="text-muted-foreground">{insights.schedulingPatterns}</p>
                </div>

                {/* Peak Times */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                        <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                        Peak Booking Times
                    </h3>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-2">Peak Days</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {insights.peakTimes.days.map((day: string, index: number) => (
                                            <Badge key={index} variant="secondary">
                                                {day}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Peak Time Slots</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {insights.peakTimes.timeSlots.map((slot: string, index: number) => (
                                            <Badge key={index} variant="secondary">
                                                {slot}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground">{insights.peakTimes.analysis}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Optimization Suggestions */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                        <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                        Optimization Suggestions
                    </h3>
                    <div className="space-y-3">
                        {insights.optimizationSuggestions.map((suggestion: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">{suggestion.title}</h4>
                                    <Badge variant={getImpactVariant(suggestion.impact)}>{suggestion.impact}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cancellation Reduction */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                        <AlertCircle className="mr-2 h-4 w-4 text-primary" />
                        Cancellation Reduction Strategies
                    </h3>
                    <div className="space-y-3">
                        {insights.cancellationReduction.map((strategy: any, index: number) => (
                            <div key={index} className="bg-primary/5 rounded-lg p-3">
                                <h4 className="font-medium mb-1">{strategy.strategy}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{strategy.description}</p>
                                <p className="text-sm font-medium">
                                    Expected Impact: <span className="text-muted-foreground">{strategy.expectedImpact}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    } else if (analysisType === "services") {
        return (
            <div className="space-y-6">
                {/* Service Analysis */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                        <Wrench className="mr-2 h-4 w-4 text-primary" />
                        Service Analysis
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 px-3">Service</th>
                                    <th className="text-left py-2 px-3">Popularity</th>
                                    <th className="text-left py-2 px-3">Profitability</th>
                                    <th className="text-left py-2 px-3">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {insights.serviceAnalysis.map((service: any, index: number) => (
                                    <tr key={index} className="border-b">
                                        <td className="py-2 px-3 font-medium">{service.serviceName}</td>
                                        <td className="py-2 px-3">
                                            <Badge variant={getRatingVariant(service.popularity)}>{service.popularity}</Badge>
                                        </td>
                                        <td className="py-2 px-3">
                                            <Badge variant={getRatingVariant(service.profitability)}>{service.profitability}</Badge>
                                        </td>
                                        <td className="py-2 px-3 text-sm text-muted-foreground">{service.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pricing Recommendations */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                        <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                        Pricing Recommendations
                    </h3>
                    <div className="space-y-3">
                        {insights.pricingRecommendations.map((rec: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">{rec.serviceName}</h4>
                                    <div className="flex items-center">
                                        <span className="text-muted-foreground line-through mr-2">${rec.currentPrice}</span>
                                        <Badge variant="default">${rec.recommendedPrice}</Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{rec.rationale}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* New Service Suggestions */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                        <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                        New Service Suggestions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.newServiceSuggestions.map((service: any, index: number) => (
                            <Card key={index}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{service.name}</CardTitle>
                                    <Badge className="mt-1" variant="outline">
                                        ${service.estimatedPrice}
                                    </Badge>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                                    <p className="text-xs font-medium">
                                        Target Market: <span className="text-muted-foreground">{service.targetMarket}</span>
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* AOV Strategies */}
                <div>
                    <h3 className="text-lg font-semibold flex items-center mb-3">
                        <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                        Average Order Value Strategies
                    </h3>
                    <div className="space-y-3">
                        {insights.aovStrategies.map((strategy: any, index: number) => (
                            <div key={index} className="bg-primary/5 rounded-lg p-3">
                                <h4 className="font-medium mb-1">{strategy.strategy}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{strategy.implementation}</p>
                                <p className="text-sm font-medium">
                                    Expected Impact: <span className="text-muted-foreground">{strategy.expectedImpact}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Fallback
    return (
        <div className="text-center py-12 text-muted-foreground">
            <p>No insights available for the selected analysis type.</p>
        </div>
    )
}

// Helper functions for styling
function getImpactColor(impact: string) {
    switch (impact.toLowerCase()) {
        case "high":
            return "bg-green-500"
        case "medium":
            return "bg-yellow-500"
        case "low":
            return "bg-blue-500"
        default:
            return "bg-gray-500"
    }
}

function getPriorityVariant(priority: string) {
    switch (priority.toLowerCase()) {
        case "high":
            return "destructive"
        case "medium":
            return "default"
        case "low":
            return "secondary"
        default:
            return "outline"
    }
}

function getImpactVariant(impact: string) {
    switch (impact.toLowerCase()) {
        case "high":
            return "default"
        case "medium":
            return "secondary"
        case "low":
            return "outline"
        default:
            return "outline"
    }
}

function getRatingVariant(rating: string) {
    switch (rating.toLowerCase()) {
        case "high":
            return "default"
        case "medium":
            return "secondary"
        case "low":
            return "outline"
        default:
            return "outline"
    }
}

