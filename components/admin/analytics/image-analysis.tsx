"use client"

import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Camera, ImageIcon, CheckCircle, XCircle, BarChart, Search, ArrowRight } from "lucide-react"

interface ImageAnalysisProps {
    organizationId: string
}

export default function ImageAnalysis({ organizationId }: ImageAnalysisProps) {
    const [timePeriod, setTimePeriod] = useState("month")
    const [activeTab, setActiveTab] = useState("overview")
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null)

    // Get analysis statistics
    const statistics = useQuery(api.serviceImages.getAnalysisStatistics, {
        organizationId,
        period: timePeriod,
    })

    // Get recent analyzed images
    const recentImages = useQuery(api.serviceImages.getServiceImages, {
        organizationId,
        limit: 10,
    })

    // Get selected image details if any
    const selectedImage = selectedImageId ? recentImages?.find((img) => img._id === selectedImageId) : null

    // Colors for quality categories
    const qualityColors = {
        excellent: "#4ade80", // green
        good: "#60a5fa", // blue
        average: "#facc15", // yellow
        poor: "#f87171", // red
    }

    // Render quality distribution chart
    const renderQualityChart = () => {
        if (!statistics) return null

        const { qualityDistribution } = statistics

        const data = [
            { name: "Excellent", value: qualityDistribution.excellent, color: qualityColors.excellent },
            { name: "Good", value: qualityDistribution.good, color: qualityColors.good },
            { name: "Average", value: qualityDistribution.average, color: qualityColors.average },
            { name: "Poor", value: qualityDistribution.poor, color: qualityColors.poor },
        ]

        return (
            <ChartContainer className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        )
    }

    // Render image comparison
    const renderImageComparison = (image: any) => {
        if (!image) return null

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">Before</h4>
                        <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                            <img
                                src={image.beforeImageUrl || "/placeholder.svg"}
                                alt="Before detailing"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-medium">After</h4>
                        <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                            <img
                                src={image.afterImageUrl || "/placeholder.svg"}
                                alt="After detailing"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>
                </div>

                {image.analysisResults && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium">Quality Score</h4>
                                <Badge variant={getQualityVariant(image.analysisResults.qualityScore)}>
                                    {image.analysisResults.qualityScore.toFixed(1)}/10
                                </Badge>
                            </div>
                            <Progress value={image.analysisResults.qualityScore * 10} className="h-2" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center">
                                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                    Improvements
                                </h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                    {image.analysisResults.improvements.map((item: string, index: number) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium flex items-center">
                                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                    Detected Issues
                                </h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                    {image.analysisResults.detectedIssues.map((item: string, index: number) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Components Detected</h4>
                            <div className="flex flex-wrap gap-2">
                                {image.analysisResults.detectedComponents.map((component: string, index: number) => (
                                    <Badge key={index} variant="outline">
                                        {component}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="bg-primary/5 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Summary</h4>
                            <p className="text-sm text-muted-foreground">{image.analysisResults.summary}</p>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Camera className="mr-2 h-5 w-5 text-primary" />
                    Service Quality Image Analysis
                </CardTitle>
                <CardDescription>
                    AI-powered analysis of before and after service images to assess quality and identify improvements.
                </CardDescription>
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
                </div>

                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="overview">
                            <BarChart className="mr-2 h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="images">
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Recent Images
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {!statistics ? (
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-64 w-full" />
                                <Skeleton className="h-32 w-full" />
                            </div>
                        ) : statistics.totalAnalyzed === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Camera className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                <p>No analyzed images available for this time period.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Total Analyzed</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{statistics.totalAnalyzed}</div>
                                            <p className="text-xs text-muted-foreground">Images analyzed in the selected period</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Average Quality Score</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{statistics.averageQualityScore.toFixed(1)}/10</div>
                                            <Progress value={statistics.averageQualityScore * 10} className="h-2 mt-2" />
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Excellent Quality</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">
                                                {statistics.qualityDistribution.excellent > 0 && statistics.totalAnalyzed > 0
                                                    ? `${((statistics.qualityDistribution.excellent / statistics.totalAnalyzed) * 100).toFixed(0)}%`
                                                    : "0%"}
                                            </div>
                                            <p className="text-xs text-muted-foreground">Services with excellent quality score (8-10)</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-4">Quality Distribution</h3>
                                        {renderQualityChart()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium mb-4">Common Issues</h3>
                                        <div className="space-y-3">
                                            {statistics.commonIssues.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="text-sm">{item.issue}</span>
                                                    <Badge variant="outline">{item.count} instances</Badge>
                                                </div>
                                            ))}
                                        </div>

                                        <h3 className="text-lg font-medium mt-6 mb-4">Common Improvements</h3>
                                        <div className="space-y-3">
                                            {statistics.commonImprovements.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center">
                                                    <span className="text-sm">{item.improvement}</span>
                                                    <Badge variant="outline">{item.count} instances</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Images Tab */}
                    <TabsContent value="images" className="space-y-6">
                        {!recentImages ? (
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-64 w-full" />
                            </div>
                        ) : recentImages.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <ImageIcon className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                <p>No service images available.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {selectedImage ? (
                                    <div className="space-y-4">
                                        <Button variant="outline" size="sm" onClick={() => setSelectedImageId(null)} className="mb-2">
                                            <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                                            Back to all images
                                        </Button>

                                        <div className="bg-muted/40 p-4 rounded-lg">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <Badge variant="outline">{selectedImage.serviceDetails?.name || "Unknown Service"}</Badge>
                                                <Badge variant="outline">{selectedImage.appointmentDetails?.date || "Unknown Date"}</Badge>
                                                {selectedImage.status === "analyzed" ? (
                                                    <Badge variant="success">Analyzed</Badge>
                                                ) : selectedImage.status === "pending" ? (
                                                    <Badge variant="secondary">Pending Analysis</Badge>
                                                ) : (
                                                    <Badge variant="destructive">Analysis Failed</Badge>
                                                )}
                                            </div>
                                        </div>

                                        {renderImageComparison(selectedImage)}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {recentImages
                                            .filter((img) => img.status === "analyzed")
                                            .map((image) => (
                                                <Card key={image._id} className="overflow-hidden">
                                                    <div className="relative aspect-video bg-muted">
                                                        <img
                                                            src={image.afterImageUrl || "/placeholder.svg"}
                                                            alt="Service result"
                                                            className="object-cover w-full h-full"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                                                            <div className="p-3 text-white">
                                                                <div className="text-sm font-medium">
                                                                    {image.serviceDetails?.name || "Unknown Service"}
                                                                </div>
                                                                <div className="text-xs opacity-80">
                                                                    {image.appointmentDetails?.date || "Unknown Date"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {image.analysisResults && (
                                                            <div className="absolute top-2 right-2">
                                                                <Badge
                                                                    variant={getQualityVariant(image.analysisResults.qualityScore)}
                                                                    className="font-bold"
                                                                >
                                                                    {image.analysisResults.qualityScore.toFixed(1)}/10
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <CardFooter className="p-3">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="w-full"
                                                            onClick={() => setSelectedImageId(image._id)}
                                                        >
                                                            <Search className="mr-2 h-4 w-4" />
                                                            View Analysis
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

// Helper functions
function getQualityVariant(score: number) {
    if (score >= 8) return "success"
    if (score >= 6) return "default"
    if (score >= 4) return "secondary"
    return "destructive"
}

