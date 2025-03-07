"use client"

import { useState } from "react"
import { useObject } from "@ai-sdk/react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, BarChart, Save, RefreshCw, ArrowRight, Check } from "lucide-react"

interface PricingOptimizerProps {
    organizationId: string
}

export default function PricingOptimizer({ organizationId }: PricingOptimizerProps) {
    const [activeTab, setActiveTab] = useState("services")
    const [optimizationLevel, setOptimizationLevel] = useState(50)
    const [applySeasonalPricing, setApplySeasonalPricing] = useState(true)
    const [selectedServices, setSelectedServices] = useState<string[]>([])
    const [savedChanges, setSavedChanges] = useState(false)

    // Get services data
    const services = useQuery(api.services.getActiveServices, { organizationId })

    // Get appointment data for analysis
    const appointmentData = useQuery(api.appointments.getAppointmentsForAnalysis, { organizationId })

    // Update service pricing mutation
    const updateServicePricing = useMutation(api.services.updateServicePricing)

    // Use AI to generate pricing recommendations
    const { object, submit, isLoading, error } = useObject({
        api: "/api/ai/pricing-optimization",
        initialObject: null,
        body: {
            organizationId,
            services,
            appointmentData,
            optimizationLevel,
            applySeasonalPricing,
            selectedServices: selectedServices.length > 0 ? selectedServices : undefined,
        },
    })

    // Generate pricing recommendations
    const generateRecommendations = () => {
        if (services && appointmentData) {
            setSavedChanges(false)
            submit()
        }
    }

    // Toggle service selection
    const toggleServiceSelection = (serviceId: string) => {
        setSelectedServices((prev) =>
            prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
        )
    }

    // Apply recommended pricing
    const applyRecommendedPricing = async () => {
        if (!object?.services) return

        try {
            // Update each service with new pricing
            for (const service of object.services) {
                await updateServicePricing({
                    serviceId: service.id,
                    newPrice: service.recommendedPrice,
                    pricingNotes: `AI optimized pricing. Previous: $${service.currentPrice}. ${service.rationale}`,
                })
            }

            setSavedChanges(true)
        } catch (error) {
            console.error("Error applying pricing recommendations:", error)
        }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-primary" />
                    AI Pricing Optimizer
                </CardTitle>
                <CardDescription>Optimize your service pricing for maximum revenue and competitiveness</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="services" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="services">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Services
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Settings
                        </TabsTrigger>
                        <TabsTrigger value="analysis">
                            <BarChart className="mr-2 h-4 w-4" />
                            Analysis
                        </TabsTrigger>
                    </TabsList>

                    {/* Services Tab */}
                    <TabsContent value="services" className="space-y-4">
                        {!services ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-sm text-muted-foreground">
                                        Select services to optimize or leave all unselected to optimize all services
                                    </p>
                                    <Button variant="outline" size="sm" onClick={() => setSelectedServices(services.map((s) => s._id))}>
                                        Select All
                                    </Button>
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {services.map((service) => (
                                        <div
                                            key={service._id}
                                            className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedServices.includes(service._id) ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                                                }`}
                                            onClick={() => toggleServiceSelection(service._id)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <div
                                                        className={`h-4 w-4 rounded-full mr-3 ${selectedServices.includes(service._id) ? "bg-primary" : "border border-muted-foreground"
                                                            }`}
                                                    >
                                                        {selectedServices.includes(service._id) && (
                                                            <Check className="h-4 w-4 text-primary-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">{service.name}</h3>
                                                        <p className="text-xs text-muted-foreground">{service.description}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold">${service.price}</p>
                                                    <p className="text-xs text-muted-foreground">Current Price</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="optimization-level">Optimization Level</Label>
                                    <span className="text-sm font-medium">{optimizationLevel}%</span>
                                </div>
                                <Slider
                                    id="optimization-level"
                                    min={10}
                                    max={90}
                                    step={10}
                                    value={[optimizationLevel]}
                                    onValueChange={(value) => setOptimizationLevel(value[0])}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Higher values prioritize revenue maximization, lower values focus on competitive positioning
                                </p>
                            </div>

                            <div className="flex items-center justify-between space-x-2">
                                <Label htmlFor="seasonal-pricing">Apply Seasonal Pricing Factors</Label>
                                <Switch
                                    id="seasonal-pricing"
                                    checked={applySeasonalPricing}
                                    onCheckedChange={setApplySeasonalPricing}
                                />
                            </div>

                            <div className="border rounded-lg p-4 bg-muted/20">
                                <h3 className="font-medium mb-2">Optimization Factors</h3>
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-start">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2 mt-1.5"></span>
                                        Historical booking data and service popularity
                                    </li>
                                    <li className="flex items-start">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2 mt-1.5"></span>
                                        Customer price sensitivity and booking patterns
                                    </li>
                                    <li className="flex items-start">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2 mt-1.5"></span>
                                        Seasonal demand fluctuations
                                    </li>
                                    <li className="flex items-start">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2 mt-1.5"></span>
                                        Service costs and profit margins
                                    </li>
                                    <li className="flex items-start">
                                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-2 mt-1.5"></span>
                                        Competitive market positioning
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Analysis Tab */}
                    <TabsContent value="analysis" className="space-y-4">
                        {!object ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <BarChart className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground text-center mb-4">
                                    Configure your settings and generate pricing recommendations
                                </p>
                                <Button onClick={generateRecommendations} disabled={isLoading || !services || !appointmentData}>
                                    {isLoading ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            Generate Recommendations
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="border rounded-lg p-4 bg-primary/5">
                                    <h3 className="font-medium mb-2">Pricing Analysis Summary</h3>
                                    <p className="text-sm">{object.summary}</p>

                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Projected Revenue Impact</p>
                                            <p
                                                className={`text-lg font-bold ${object.projectedRevenueImpact > 0 ? "text-green-500" : "text-red-500"
                                                    }`}
                                            >
                                                {object.projectedRevenueImpact > 0 ? "+" : ""}
                                                {object.projectedRevenueImpact}%
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Avg. Price Change</p>
                                            <p className="text-lg font-bold">
                                                {object.averagePriceChange > 0 ? "+" : ""}${object.averagePriceChange}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Competitive Position</p>
                                            <p className="text-lg font-bold">{object.competitivePosition}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="font-medium">Service Pricing Recommendations</h3>
                                    {object.services.map((service: any) => (
                                        <div key={service.id} className="border rounded-lg p-3">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-medium">{service.name}</h4>
                                                <Badge
                                                    variant={
                                                        service.changePercentage > 10
                                                            ? "destructive"
                                                            : service.changePercentage > 5
                                                                ? "default"
                                                                : "secondary"
                                                    }
                                                >
                                                    {service.changePercentage > 0 ? "+" : ""}
                                                    {service.changePercentage}%
                                                </Badge>
                                            </div>

                                            <div className="flex justify-between items-center mt-2">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Current</p>
                                                    <p className="font-medium">${service.currentPrice}</p>
                                                </div>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Recommended</p>
                                                    <p className="font-medium">${service.recommendedPrice}</p>
                                                </div>
                                            </div>

                                            <p className="text-xs text-muted-foreground mt-2">{service.rationale}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={generateRecommendations}
                    disabled={isLoading || !services || !appointmentData}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh Analysis
                </Button>

                {object && (
                    <Button onClick={applyRecommendedPricing} disabled={savedChanges}>
                        <Save className="mr-2 h-4 w-4" />
                        {savedChanges ? "Changes Applied" : "Apply Recommendations"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

