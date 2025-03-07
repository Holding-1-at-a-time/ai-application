"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BellRing, MessageSquare, TrendingUp, Calendar, DollarSign, Wrench, Phone, Mail, Bell } from "lucide-react"

interface AlertSettingsProps {
    organizationId: string
}

export default function AlertSettings({ organizationId }: AlertSettingsProps) {
    const [activeTab, setActiveTab] = useState("general")
    const [isSaving, setIsSaving] = useState(false)

    // Get current alert settings
    const settings = useQuery(api.alerts.getAlertSettings, {
        organizationId,
    })

    // Save settings mutation
    const saveSettings = useMutation(api.alerts.saveAlertSettings)

    // Form state
    const [formState, setFormState] = useState({
        sentimentThreshold: 3,
        patternChangeThreshold: 25,
        enableSentimentAlerts: true,
        enablePatternAlerts: true,
        enableBookingAlerts: true,
        enableRevenueAlerts: true,
        enableQualityAlerts: true,
        notificationChannels: ["in-app"],
        notificationRecipients: [],
    })

    // Update form state when settings are loaded
    useEffect(() => {
        if (settings) {
            setFormState({
                sentimentThreshold: settings.sentimentThreshold,
                patternChangeThreshold: settings.patternChangeThreshold,
                enableSentimentAlerts: settings.enableSentimentAlerts,
                enablePatternAlerts: settings.enablePatternAlerts,
                enableBookingAlerts: settings.enableBookingAlerts,
                enableRevenueAlerts: settings.enableRevenueAlerts,
                enableQualityAlerts: settings.enableQualityAlerts,
                notificationChannels: settings.notificationChannels,
                notificationRecipients: settings.notificationRecipients,
            })
        }
    }, [settings])

    // Handle form changes
    const handleSwitchChange = (field: string) => (checked: boolean) => {
        setFormState((prev) => ({
            ...prev,
            [field]: checked,
        }))
    }

    const handleSliderChange = (field: string) => (value: number[]) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value[0],
        }))
    }

    const handleChannelToggle = (channel: string) => {
        setFormState((prev) => {
            const channels = [...prev.notificationChannels]

            if (channels.includes(channel)) {
                return {
                    ...prev,
                    notificationChannels: channels.filter((c) => c !== channel),
                }
            } else {
                return {
                    ...prev,
                    notificationChannels: [...channels, channel],
                }
            }
        })
    }

    // Handle form submission
    const handleSave = async () => {
        setIsSaving(true)

        try {
            await saveSettings({
                organizationId,
                ...formState,
            })

            toast({
                title: "Settings saved",
                description: "Alert settings have been updated successfully.",
            })
        } catch (error) {
            console.error("Error saving settings:", error)

            toast({
                title: "Error",
                description: "Failed to save alert settings. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (!settings) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Alert Settings</CardTitle>
                    <CardDescription>Configure when and how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
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
                    Alert Settings
                </CardTitle>
                <CardDescription>Configure when and how you receive alerts</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="general">
                            <Bell className="mr-2 h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="thresholds">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Thresholds
                        </TabsTrigger>
                        <TabsTrigger value="notifications">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Alert Types</h3>
                            <p className="text-sm text-muted-foreground">Enable or disable different types of alerts</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">
                                            <MessageSquare className="inline-block mr-2 h-4 w-4" />
                                            Negative Sentiment Alerts
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Get alerted when customers leave negative feedback</p>
                                    </div>
                                    <Switch
                                        checked={formState.enableSentimentAlerts}
                                        onCheckedChange={handleSwitchChange("enableSentimentAlerts")}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">
                                            <TrendingUp className="inline-block mr-2 h-4 w-4" />
                                            Pattern Change Alerts
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Get alerted when business patterns change significantly
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formState.enablePatternAlerts}
                                        onCheckedChange={handleSwitchChange("enablePatternAlerts")}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">
                                            <Calendar className="inline-block mr-2 h-4 w-4" />
                                            Booking Alerts
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Get alerted about unusual changes in booking volume</p>
                                    </div>
                                    <Switch
                                        checked={formState.enableBookingAlerts}
                                        onCheckedChange={handleSwitchChange("enableBookingAlerts")}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">
                                            <DollarSign className="inline-block mr-2 h-4 w-4" />
                                            Revenue Alerts
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Get alerted about significant changes in revenue</p>
                                    </div>
                                    <Switch
                                        checked={formState.enableRevenueAlerts}
                                        onCheckedChange={handleSwitchChange("enableRevenueAlerts")}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">
                                            <Wrench className="inline-block mr-2 h-4 w-4" />
                                            Quality Alerts
                                        </Label>
                                        <p className="text-sm text-muted-foreground">Get alerted about service quality issues</p>
                                    </div>
                                    <Switch
                                        checked={formState.enableQualityAlerts}
                                        onCheckedChange={handleSwitchChange("enableQualityAlerts")}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Thresholds Tab */}
                    <TabsContent value="thresholds" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Alert Thresholds</h3>
                            <p className="text-sm text-muted-foreground">Configure when alerts should be triggered</p>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Negative Sentiment Threshold</Label>
                                        <Badge variant="outline">{formState.sentimentThreshold}/10</Badge>
                                    </div>
                                    <Slider
                                        value={[formState.sentimentThreshold]}
                                        min={1}
                                        max={5}
                                        step={1}
                                        onValueChange={handleSliderChange("sentimentThreshold")}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Alert when customer feedback rating is at or below this value
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>Pattern Change Threshold</Label>
                                        <Badge variant="outline">{formState.patternChangeThreshold}%</Badge>
                                    </div>
                                    <Slider
                                        value={[formState.patternChangeThreshold]}
                                        min={10}
                                        max={50}
                                        step={5}
                                        onValueChange={handleSliderChange("patternChangeThreshold")}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Alert when business metrics change by this percentage or more
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Notification Channels</h3>
                            <p className="text-sm text-muted-foreground">Choose how you want to receive alerts</p>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="channel-in-app"
                                        checked={formState.notificationChannels.includes("in-app")}
                                        onCheckedChange={() => handleChannelToggle("in-app")}
                                    />
                                    <Label htmlFor="channel-in-app" className="flex items-center">
                                        <Bell className="mr-2 h-4 w-4" />
                                        In-app notifications
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="channel-email"
                                        checked={formState.notificationChannels.includes("email")}
                                        onCheckedChange={() => handleChannelToggle("email")}
                                    />
                                    <Label htmlFor="channel-email" className="flex items-center">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Email notifications
                                    </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="channel-sms"
                                        checked={formState.notificationChannels.includes("sms")}
                                        onCheckedChange={() => handleChannelToggle("sms")}
                                    />
                                    <Label htmlFor="channel-sms" className="flex items-center">
                                        <Phone className="mr-2 h-4 w-4" />
                                        SMS notifications
                                    </Label>
                                </div>
                            </div>

                            <div className="pt-4">
                                <h3 className="text-lg font-medium mb-2">Notification Recipients</h3>
                                <p className="text-sm text-muted-foreground mb-4">Configure who receives alerts (coming soon)</p>

                                <div className="bg-muted/40 p-4 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        Currently, all organization administrators will receive alerts. Recipient management will be
                                        available in a future update.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving} className="ml-auto">
                    {isSaving ? "Saving..." : "Save Settings"}
                </Button>
            </CardFooter>
        </Card>
    )
}

