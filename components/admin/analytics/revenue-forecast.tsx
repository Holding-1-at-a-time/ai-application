import { Badge } from "@/components/ui/badge"
import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react"

interface RevenueForecastProps {
    forecast: any
}

export default function RevenueForecast({ forecast }: RevenueForecastProps) {
    return (
        <div className="space-y-6">
            {/* Forecast Summary */}
            <div className="bg-primary/5 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-primary" />
                        Revenue Forecast Summary
                    </h3>
                    <Badge variant={getGrowthVariant(forecast.overallGrowth)}>
                        {forecast.overallGrowth > 0 ? "+" : ""}
                        {(forecast.overallGrowth * 100).toFixed(1)}% Growth
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                    Forecast period: {forecast.startDate} to {forecast.endDate} ({forecast.forecastPeriod} months)
                </p>
            </div>

            {/* Monthly Forecasts */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Monthly Revenue Projections</h3>
                <div className="relative">
                    {/* Revenue Chart */}
                    <div className="h-64 mb-4 relative">
                        <div className="absolute inset-0 flex items-end">
                            {forecast.monthlyForecasts.map((month: any, index: number) => {
                                // Calculate max revenue for scaling
                                const maxRevenue = Math.max(...forecast.monthlyForecasts.map((m: any) => m.revenue))
                                const height = (month.revenue / maxRevenue) * 100

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center">
                                        <div
                                            className={`w-full mx-1 rounded-t ${getConfidenceColor(month.confidence)}`}
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="w-full h-full relative group">
                                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 mb-1 transition-opacity">
                                                    ${month.revenue.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-xs mt-1 text-muted-foreground">{month.month}</div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Confidence Legend */}
                    <div className="flex justify-end items-center space-x-4 mb-4">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                            <span className="text-xs">High confidence</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                            <span className="text-xs">Medium confidence</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                            <span className="text-xs">Low confidence</span>
                        </div>
                    </div>

                    {/* Monthly Details */}
                    <div className="space-y-3 mt-6">
                        {forecast.monthlyForecasts.map((month: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-medium">{month.month}</h4>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">{(month.confidence * 100).toFixed(0)}% confidence</Badge>
                                        <span className="font-bold">${month.revenue.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {month.factors.map((factor: string, i: number) => (
                                        <Badge key={i} variant="secondary">
                                            {factor}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Risks */}
            <div>
                <h3 className="text-lg font-semibold flex items-center mb-3">
                    <AlertCircle className="mr-2 h-4 w-4 text-primary" />
                    Forecast Risks
                </h3>
                <div className="space-y-3">
                    {forecast.risks.map((risk: any, index: number) => (
                        <div key={index} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{risk.risk}</h4>
                                <Badge variant={getImpactVariant(risk.impact)}>{risk.impact} impact</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{risk.mitigation}</p>
                        </div>
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
                    {forecast.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="bg-primary/5 rounded-lg p-3">
                            <h4 className="font-medium mb-1">{rec.title}</h4>
                            <p className="text-sm text-muted-foreground">{rec.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Helper functions for styling
function getGrowthVariant(growth: number) {
    if (growth > 0.1) return "default"
    if (growth > 0) return "secondary"
    if (growth > -0.1) return "outline"
    return "destructive"
}

function getConfidenceColor(confidence: number) {
    if (confidence >= 0.7) return "bg-green-500"
    if (confidence >= 0.4) return "bg-yellow-500"
    return "bg-red-500"
}

function getImpactVariant(impact: string) {
    switch (impact.toLowerCase()) {
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

