"use client"

import { useState } from "react"
import { useQuery, useAction, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
    FileText,
    TrendingUp,
    Sparkles,
    ListChecksIcon as ListCheck,
    Download,
    Printer,
    ArchiveIcon,
    PlusCircle,
    Search,
    AlertCircle,
    Lightbulb,
} from "lucide-react"

interface ExecutiveReportGeneratorProps {
    organizationId: string
}

export default function ExecutiveReportGenerator({ organizationId }: ExecutiveReportGeneratorProps) {
    const [activeTab, setActiveTab] = useState("generator")
    const [isGenerating, setIsGenerating] = useState(false)
    const [activeReport, setActiveReport] = useState<string | null>(null)

    // Form state
    const [formState, setFormState] = useState({
        title: "",
        timeframe: "month",
        focusAreas: [] as string[],
        audienceType: "executive",
    })

    // Focus areas options
    const focusAreas = [
        { id: "revenue", label: "Revenue" },
        { id: "operations", label: "Operations" },
        { id: "customers", label: "Customers" },
        { id: "services", label: "Services" },
        { id: "staff", label: "Staff" },
        { id: "marketing", label: "Marketing" },
    ]

    // Get reports
    const reports = useQuery(api.reports.getOrganizationReports, {
        organizationId,
        includeArchived: false,
    })

    // Get active report
    const reportData = useQuery(api.reports.getReportById, activeReport ? { reportId: activeReport } : "skip")

    // Generate report action
    const generateReport = useAction(api.reports.generateExecutiveReport)
    const archiveReport = useMutation(api.reports.toggleReportArchived)

    // Handle form changes
    const handleFormChange = (field: string, value: string) => {
        setFormState({
            ...formState,
            [field]: value,
        })
    }

    // Handle focus area toggle
    const handleFocusAreaToggle = (area: string) => {
        setFormState((prev) => {
            const areas = [...prev.focusAreas]
            if (areas.includes(area)) {
                return {
                    ...prev,
                    focusAreas: areas.filter((a) => a !== area),
                }
            } else {
                return {
                    ...prev,
                    focusAreas: [...areas, area],
                }
            }
        })
    }

    // Handle report generation
    const handleGenerateReport = async () => {
        if (!formState.timeframe) {
            toast({
                title: "Missing timeframe",
                description: "Please select a timeframe for the report.",
                variant: "destructive",
            })
            return
        }

        setIsGenerating(true)
        try {
            const result = await generateReport({
                organizationId,
                title: formState.title || undefined,
                timeframe: formState.timeframe,
                focusAreas: formState.focusAreas,
                audienceType: formState.audienceType,
            })

            toast({
                title: "Report generated",
                description: "The executive report has been successfully generated.",
            })

            // Reset form and switch to report view
            setFormState({
                title: "",
                timeframe: "month",
                focusAreas: [],
                audienceType: "executive",
            })

            // Set active report and switch to reports tab
            if (result?.reportId) {
                setActiveReport(result.reportId)
                setActiveTab("reports")
            }
        } catch (error) {
            console.error("Error generating report:", error)
            toast({
                title: "Generation failed",
                description: "Failed to generate report. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsGenerating(false)
        }
    }

    // Handle report selection
    const handleSelectReport = (id: string) => {
        setActiveReport(id)
    }

    // Handle report archiving
    const handleArchiveReport = async () => {
        if (!activeReport) return

        try {
            await archiveReport({
                reportId: activeReport,
                isArchived: true,
            })

            toast({
                title: "Report archived",
                description: "The report has been archived.",
            })

            setActiveReport(null)
        } catch (error) {
            console.error("Error archiving report:", error)
            toast({
                title: "Archive failed",
                description: "Failed to archive report. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    // Get timeframe label
    const getTimeframeLabel = (timeframe: string) => {
        switch (timeframe) {
            case "week":
                return "Last Week"
            case "month":
                return "Last Month"
            case "quarter":
                return "Last Quarter"
            case "year":
                return "Last Year"
            default:
                return timeframe
        }
    }

    return (
        <Card className="h-[700px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary" />
                    Executive Reports
                </CardTitle>
                <CardDescription>Generate and view comprehensive business reports</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                <Tabs defaultValue="generator" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="generator">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate Report
                        </TabsTrigger>
                        <TabsTrigger value="reports">
                            <FileText className="mr-2 h-4 w-4" />
                            View Reports
                        </TabsTrigger>
                    </TabsList>

                    {/* Generator Tab */}
                    <TabsContent value="generator" className="flex-1 overflow-y-auto">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="report-title">Report Title (optional)</Label>
                                <Input
                                    id="report-title"
                                    placeholder="Enter a title for your report"
                                    value={formState.title}
                                    onChange={(e) => handleFormChange("title", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    If left blank, a title will be automatically generated based on the timeframe and focus areas.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeframe">Timeframe</Label>
                                <Select value={formState.timeframe} onValueChange={(value) => handleFormChange("timeframe", value)}>
                                    <SelectTrigger id="timeframe">
                                        <SelectValue placeholder="Select timeframe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="week">Last Week</SelectItem>
                                        <SelectItem value="month">Last Month</SelectItem>
                                        <SelectItem value="quarter">Last Quarter</SelectItem>
                                        <SelectItem value="year">Last Year</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Focus Areas (optional)</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {focusAreas.map((area) => (
                                        <div key={area.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`focus-${area.id}`}
                                                checked={formState.focusAreas.includes(area.id)}
                                                onCheckedChange={() => handleFocusAreaToggle(area.id)}
                                            />
                                            <Label htmlFor={`focus-${area.id}`} className="cursor-pointer">
                                                {area.label}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Select specific areas to focus on, or leave blank for a balanced report.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="audience">Target Audience</Label>
                                <Select
                                    value={formState.audienceType}
                                    onValueChange={(value) => handleFormChange("audienceType", value)}
                                >
                                    <SelectTrigger id="audience">
                                        <SelectValue placeholder="Select audience" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="executive">Executive (concise)</SelectItem>
                                        <SelectItem value="management">Management (detailed)</SelectItem>
                                        <SelectItem value="stakeholder">Stakeholder (strategic)</SelectItem>
                                        <SelectItem value="operational">Operational (tactical)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    The report will be tailored to the selected audience with appropriate level of detail.
                                </p>
                            </div>

                            <Button onClick={handleGenerateReport} disabled={isGenerating || !formState.timeframe} className="w-full">
                                {isGenerating ? (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="mr-2 h-4 w-4" />
                                        Generate Report
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Reports Tab */}
                    <TabsContent value="reports" className="flex-1 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <Input
                                placeholder="Search reports..."
                                className="max-w-sm"
                                prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                            />
                            <Button
                                onClick={() => {
                                    setActiveReport(null)
                                    setActiveTab("generator")
                                }}
                                variant="outline"
                                size="sm"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Report
                            </Button>
                        </div>

                        <div className="flex-1 overflow-hidden flex">
                            {!reports ? (
                                <div className="w-1/3 pr-4 space-y-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : (
                                <div className="w-1/3 pr-4 overflow-y-auto">
                                    {reports.length === 0 ? (
                                        <div className="text-center py-6 text-muted-foreground">
                                            <FileText className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                            <p>No reports yet.</p>
                                            <Button onClick={() => setActiveTab("generator")} variant="link" className="mt-2">
                                                Generate a report
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {reports.map((report) => (
                                                <div
                                                    key={report._id}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${activeReport === report._id ? "bg-primary/10 border-primary/50" : "hover:bg-muted/50"
                                                        }`}
                                                    onClick={() => handleSelectReport(report._id)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium text-sm line-clamp-1">{report.title}</h4>
                                                        <Badge variant="outline">{getTimeframeLabel(report.timeframe)}</Badge>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-xs text-muted-foreground">{formatDate(report.createdAt)}</span>
                                                        {report.focusAreas.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {report.focusAreas.map((area) => (
                                                                    <Badge key={area} variant="secondary" className="text-xs">
                                                                        {area}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Report view */}
                            <div className="flex-1 border-l pl-4 overflow-y-auto">
                                {activeReport && reportData ? (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-xl font-bold">{reportData.report.title}</h2>
                                                <p className="text-sm text-muted-foreground">Generated on {formatDate(reportData.createdAt)}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button variant="outline" size="sm">
                                                    <Printer className="mr-2 h-4 w-4" />
                                                    Print
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={handleArchiveReport}>
                                                    <ArchiveIcon className="mr-2 h-4 w-4" />
                                                    Archive
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">Executive Summary</h3>
                                            <p className="text-sm">{reportData.report.summary}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold flex items-center">
                                                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                                                Key Metrics
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {reportData.report.key_metrics.map((metric, idx) => (
                                                    <div key={idx} className="border rounded-lg p-3">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-medium">{metric.name}</h4>
                                                            <Badge
                                                                variant={
                                                                    metric.trend === "up"
                                                                        ? "success"
                                                                        : metric.trend === "down"
                                                                            ? "destructive"
                                                                            : "secondary"
                                                                }
                                                            >
                                                                {metric.change}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-2xl font-bold mt-2">{metric.value}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{metric.insight}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold flex items-center">
                                                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                                                Highlights
                                            </h3>
                                            <div className="space-y-3">
                                                {reportData.report.highlights.map((highlight, idx) => (
                                                    <div key={idx} className="bg-primary/5 rounded-lg p-3">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-medium">{highlight.title}</h4>
                                                            <Badge variant="outline">{highlight.category}</Badge>
                                                        </div>
                                                        <p className="text-sm mt-1">{highlight.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold flex items-center">
                                                    <AlertCircle className="mr-2 h-5 w-5 text-primary" />
                                                    Challenges
                                                </h3>
                                                <div className="space-y-3">
                                                    {reportData.report.challenges.map((challenge, idx) => (
                                                        <div key={idx} className="border rounded-lg p-3">
                                                            <h4 className="font-medium">{challenge.title}</h4>
                                                            <p className="text-sm mt-1">{challenge.description}</p>
                                                            <div className="mt-2 space-y-1">
                                                                <p className="text-xs font-medium">Potential Impact:</p>
                                                                <p className="text-xs text-muted-foreground">{challenge.potentialImpact}</p>
                                                                <p className="text-xs font-medium mt-1">Recommended Action:</p>
                                                                <p className="text-xs text-muted-foreground">{challenge.recommendedAction}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold flex items-center">
                                                    <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                                                    Opportunities
                                                </h3>
                                                <div className="space-y-3">
                                                    {reportData.report.opportunities.map((opportunity, idx) => (
                                                        <div key={idx} className="border rounded-lg p-3">
                                                            <h4 className="font-medium">{opportunity.title}</h4>
                                                            <p className="text-sm mt-1">{opportunity.description}</p>
                                                            <div className="mt-2 space-y-1">
                                                                <p className="text-xs font-medium">Potential Benefit:</p>
                                                                <p className="text-xs text-muted-foreground">{opportunity.potentialBenefit}</p>
                                                                <p className="text-xs font-medium mt-1">Recommended Action:</p>
                                                                <p className="text-xs text-muted-foreground">{opportunity.recommendedAction}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold flex items-center">
                                                <ListCheck className="mr-2 h-5 w-5 text-primary" />
                                                Next Steps
                                            </h3>
                                            <div className="bg-muted/40 rounded-lg p-4">
                                                <ul className="space-y-2">
                                                    {reportData.report.nextSteps.map((step, idx) => (
                                                        <li key={idx} className="flex items-start">
                                                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-medium mr-2 mt-0.5">
                                                                {idx + 1}
                                                            </span>
                                                            <span>{step}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="text-xs text-muted-foreground pt-4 border-t">
                                            <p>Report generated at: {reportData.report.appendix.generatedAt}</p>
                                            <p className="mt-1">Data sources: {reportData.report.appendix.dataSourcesUsed.join(", ")}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
                                        <h3 className="text-xl font-medium mb-2">No report selected</h3>
                                        <p className="text-muted-foreground max-w-md">
                                            Select a report from the list or generate a new report to view detailed insights about your
                                            business.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

