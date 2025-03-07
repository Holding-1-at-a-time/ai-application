"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
    BellRing,
    MessageSquare,
    TrendingUp,
    Calendar,
    DollarSign,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
} from "lucide-react"

interface AlertListProps {
    organizationId: string
}

export default function AlertList({ organizationId }: AlertListProps) {
    const [activeTab, setActiveTab] = useState("new")

    // Get alerts
    const alerts = useQuery(api.alerts.getAlerts, {
        organizationId,
        status: activeTab === "all" ? undefined : activeTab,
    })

    // Update alert status mutation
    const updateAlertStatus = useMutation(api.alerts.updateAlertStatus)

    // Handle acknowledging an alert
    const handleAcknowledge = async (alertId: string) => {
        try {
            await updateAlertStatus({
                alertId,
                status: "acknowledged",
            })

            toast({
                title: "Alert acknowledged",
                description: "The alert has been marked as acknowledged.",
            })
        } catch (error) {
            console.error("Error acknowledging alert:", error)

            toast({
                title: "Error",
                description: "Failed to acknowledge alert. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Handle resolving an alert
    const handleResolve = async (alertId: string) => {
        try {
            await updateAlertStatus({
                alertId,
                status: "resolved",
            })

            toast({
                title: "Alert resolved",
                description: "The alert has been marked as resolved.",
            })
        } catch (error) {
            console.error("Error resolving alert:", error)

            toast({
                title: "Error",
                description: "Failed to resolve alert. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Handle dismissing an alert
    const handleDismiss = async (alertId: string) => {
        try {
            await updateAlertStatus({
                alertId,
                status: "dismissed",
            })

            toast({
                title: "Alert dismissed",
                description: "The alert has been dismissed.",
            })
        } catch (error) {
            console.error("Error dismissing alert:", error)

            toast({
                title: "Error",
                description: "Failed to dismiss alert. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Get alert icon based on type
    const getAlertIcon = (type: string) => {
        switch (type) {
            case "sentiment":
                return <MessageSquare className="h-5 w-5 text-yellow-500" />
            case "pattern":
                return <TrendingUp className="h-5 w-5 text-blue-500" />
            case "booking":
                return <Calendar className="h-5 w-5 text-purple-500" />
            case "revenue":
                return <DollarSign className="h-5 w-5 text-green-500" />
            case "quality":
                return <AlertTriangle className="h-5 w-5 text-orange-500" />
            default:
                return <BellRing className="h-5 w-5 text-gray-500" />
        }
    }

    // Get severity badge variant
    const getSeverityVariant = (severity: string) => {
        switch (severity) {
            case "low":
                return "outline"
            case "medium":
                return "secondary"
            case "high":
                return "default"
            case "critical":
                return "destructive"
            default:
                return "outline"
        }
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        }).format(date)
    }

    if (!alerts) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Alerts</CardTitle>
                    <CardDescription>View and manage system alerts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <BellRing className="mr-2 h-5 w-5 text-primary" />
                    Alerts
                </CardTitle>
                <CardDescription>View and manage system alerts</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="new" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="new">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            New
                        </TabsTrigger>
                        <TabsTrigger value="acknowledged">
                            <Clock className="mr-2 h-4 w-4" />
                            In Progress
                        </TabsTrigger>
                        <TabsTrigger value="resolved">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Resolved
                        </TabsTrigger>
                        <TabsTrigger value="all">
                            <BellRing className="mr-2 h-4 w-4" />
                            All
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="space-y-4">
                        {alerts.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <BellRing className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                <p>No {activeTab === "all" ? "" : activeTab} alerts found.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {alerts.map((alert) => (
                                    <div key={alert._id} className="border rounded-lg overflow-hidden">
                                        <div className="flex items-center justify-between p-4 bg-muted/40">
                                            <div className="flex items-center">
                                                {getAlertIcon(alert.type)}
                                                <span className="ml-2 font-medium">{alert.title}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Badge variant={getSeverityVariant(alert.severity)}>{alert.severity}</Badge>
                                                <Badge variant="outline">{formatDate(alert.createdAt)}</Badge>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-sm text-muted-foreground mb-4">{alert.description}</p>

                                            {/* Alert details based on type */}
                                            {alert.type === "sentiment" && (
                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md mb-4">
                                                    <p className="text-sm">
                                                        <span className="font-medium">Rating:</span> {alert.data.rating}/10
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">Comment:</span> "{alert.data.comment}"
                                                    </p>
                                                </div>
                                            )}

                                            {alert.type === "pattern" && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-4">
                                                    <p className="text-sm">
                                                        <span className="font-medium">Change:</span> {alert.data.percentChange > 0 ? "+" : ""}
                                                        {alert.data.percentChange.toFixed(1)}%
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">Current:</span> {alert.data.currentValue} (
                                                        {alert.data.currentPeriod})
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="font-medium">Previous:</span> {alert.data.previousValue} (
                                                        {alert.data.previousPeriod})
                                                    </p>
                                                </div>
                                            )}

                                            {/* Action buttons */}
                                            {alert.status === "new" && (
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleDismiss(alert._id)}>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Dismiss
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleAcknowledge(alert._id)}>
                                                        <Clock className="mr-2 h-4 w-4" />
                                                        Acknowledge
                                                    </Button>
                                                    <Button variant="default" size="sm" onClick={() => handleResolve(alert._id)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Resolve
                                                    </Button>
                                                </div>
                                            )}

                                            {alert.status === "acknowledged" && (
                                                <div className="flex justify-end space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleDismiss(alert._id)}>
                                                        <XCircle className="mr-2 h-4 w-4" />
                                                        Dismiss
                                                    </Button>
                                                    <Button variant="default" size="sm" onClick={() => handleResolve(alert._id)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Resolve
                                                    </Button>
                                                </div>
                                            )}
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

