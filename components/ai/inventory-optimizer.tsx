"use client"

import { useState } from "react"
import { useObject } from "@ai-sdk/react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
    Package,
    TrendingUp,
    AlertTriangle,
    ShoppingCart,
    RefreshCw,
    Save,
    Search,
    ArrowUpDown,
    Check,
} from "lucide-react"

interface InventoryOptimizerProps {
    organizationId: string
}

export default function InventoryOptimizer({ organizationId }: InventoryOptimizerProps) {
    const [activeTab, setActiveTab] = useState("current")
    const [searchQuery, setSearchQuery] = useState("")
    const [savedChanges, setSavedChanges] = useState(false)

    // Get inventory data
    const inventoryData = useQuery(api.inventory.getInventoryItems, { organizationId })

    // Get usage data
    const usageData = useQuery(api.inventory.getInventoryUsage, { organizationId })

    // Update inventory levels mutation
    const updateInventoryLevels = useMutation(api.inventory.updateInventoryLevels)

    // Use AI to generate inventory recommendations
    const { object, submit, isLoading, error } = useObject({
        api: "/api/ai/inventory-optimization",
        initialObject: null,
        body: {
            organizationId,
            inventoryData,
            usageData,
        },
    })

    // Generate inventory recommendations
    const generateRecommendations = () => {
        if (inventoryData && usageData) {
            setSavedChanges(false)
            submit()
        }
    }

    // Apply recommended inventory levels
    const applyRecommendedLevels = async () => {
        if (!object?.items) return

        try {
            // Update each inventory item with new levels
            for (const item of object.items) {
                await updateInventoryLevels({
                    itemId: item.id,
                    minLevel: item.recommendedMinLevel,
                    optimalLevel: item.recommendedOptimalLevel,
                    notes: `AI optimized inventory levels. Previous: Min ${item.currentMinLevel}, Optimal ${item.currentOptimalLevel}`,
                })
            }

            setSavedChanges(true)
        } catch (error) {
            console.error("Error applying inventory recommendations:", error)
        }
    }

    // Filter items based on search query
    const filteredItems = object?.items
        ? object.items.filter(
            (item: any) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        : []

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5 text-primary" />
                    Inventory Optimization
                </CardTitle>
                <CardDescription>AI-powered inventory management and optimization</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="current">
                            <Package className="mr-2 h-4 w-4" />
                            Current Inventory
                        </TabsTrigger>
                        <TabsTrigger value="recommendations">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Recommendations
                        </TabsTrigger>
                        <TabsTrigger value="alerts">
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Alerts
                        </TabsTrigger>
                    </TabsList>

                    {/* Current Inventory Tab */}
                    <TabsContent value="current" className="space-y-4">
                        {!inventoryData ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <Input
                                        placeholder="Search inventory items..."
                                        className="max-w-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={generateRecommendations}
                                        disabled={isLoading || !inventoryData || !usageData}
                                    >
                                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                                        {isLoading ? "Analyzing..." : "Optimize Inventory"}
                                    </Button>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                    <div className="grid grid-cols-6 gap-4 p-3 bg-muted/50 font-medium text-sm">
                                        <div className="col-span-2">Item</div>
                                        <div>Current</div>
                                        <div>Min Level</div>
                                        <div>Optimal</div>
                                        <div>Status</div>
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto">
                                        {inventoryData.map((item) => (
                                            <div key={item._id} className="grid grid-cols-6 gap-4 p-3 border-t items-center text-sm">
                                                <div className="col-span-2">
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground">{item.category}</div>
                                                </div>
                                                <div>
                                                    {item.currentLevel} {item.unit}
                                                </div>
                                                <div>
                                                    {item.minLevel} {item.unit}
                                                </div>
                                                <div>
                                                    {item.optimalLevel} {item.unit}
                                                </div>
                                                <div>
                                                    <Badge
                                                        variant={
                                                            item.currentLevel <= item.minLevel
                                                                ? "destructive"
                                                                : item.currentLevel < item.optimalLevel
                                                                    ? "default"
                                                                    : "success"
                                                        }
                                                    >
                                                        {item.currentLevel <= item.minLevel
                                                            ? "Low"
                                                            : item.currentLevel < item.optimalLevel
                                                                ? "Adequate"
                                                                : "Optimal"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Recommendations Tab */}
                    <TabsContent value="recommendations" className="space-y-4">
                        {!object ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <TrendingUp className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground text-center mb-4">
                                    Generate inventory optimization recommendations to view this section
                                </p>
                                <Button onClick={generateRecommendations} disabled={isLoading || !inventoryData || !usageData}>
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
                            <>
                                <div className="border rounded-lg p-4 bg-primary/5">
                                    <h3 className="font-medium mb-2">Optimization Summary</h3>
                                    <p className="text-sm">{object.summary}</p>

                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Projected Cost Savings</p>
                                            <p className="text-lg font-bold text-green-500">${object.projectedSavings}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Stockout Risk Reduction</p>
                                            <p className="text-lg font-bold">{object.stockoutRiskReduction}%</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground">Inventory Efficiency</p>
                                            <p className="text-lg font-bold">{object.inventoryEfficiency}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <Input
                                        placeholder="Search inventory items..."
                                        className="max-w-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                                    />
                                    <Button variant="outline" size="sm" onClick={() => setActiveTab("alerts")}>
                                        <AlertTriangle className="mr-2 h-4 w-4" />
                                        View Alerts ({object.alerts.length})
                                    </Button>
                                </div>

                                <div className="border rounded-lg overflow-hidden">
                                    <div className="grid grid-cols-7 gap-4 p-3 bg-muted/50 font-medium text-sm">
                                        <div className="col-span-2">Item</div>
                                        <div>Current</div>
                                        <div>Current Min</div>
                                        <div>Recommended Min</div>
                                        <div>Recommended Optimal</div>
                                        <div>Change</div>
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto">
                                        {filteredItems.map((item: any) => (
                                            <div key={item.id} className="grid grid-cols-7 gap-4 p-3 border-t items-center text-sm">
                                                <div className="col-span-2">
                                                    <div className="font-medium">{item.name}</div>
                                                    <div className="text-xs text-muted-foreground">{item.category}</div>
                                                </div>
                                                <div>
                                                    {item.currentLevel} {item.unit}
                                                </div>
                                                <div>
                                                    {item.currentMinLevel} {item.unit}
                                                </div>
                                                <div
                                                    className={
                                                        item.currentMinLevel !== item.recommendedMinLevel ? "font-medium text-primary" : ""
                                                    }
                                                >
                                                    {item.recommendedMinLevel} {item.unit}
                                                </div>
                                                <div
                                                    className={
                                                        item.currentOptimalLevel !== item.recommendedOptimalLevel ? "font-medium text-primary" : ""
                                                    }
                                                >
                                                    {item.recommendedOptimalLevel} {item.unit}
                                                </div>
                                                <div>
                                                    <Badge
                                                        variant={
                                                            item.currentMinLevel === item.recommendedMinLevel &&
                                                                item.currentOptimalLevel === item.recommendedOptimalLevel
                                                                ? "secondary"
                                                                : "default"
                                                        }
                                                    >
                                                        {item.changePercentage > 0 ? "+" : ""}
                                                        {item.changePercentage}%
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-muted-foreground">
                                        {filteredItems.length} items optimized based on usage patterns and business needs
                                    </p>
                                    <Button onClick={applyRecommendedLevels} disabled={savedChanges}>
                                        {savedChanges ? (
                                            <>
                                                <Check className="mr-2 h-4 w-4" />
                                                Changes Applied
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Apply Recommendations
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Alerts Tab */}
                    <TabsContent value="alerts" className="space-y-4">
                        {!object ? (
                            <div className="flex flex-col items-center justify-center py-6">
                                <AlertTriangle className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <p className="text-muted-foreground text-center mb-4">
                                    Generate inventory optimization recommendations to view alerts
                                </p>
                                <Button onClick={generateRecommendations} disabled={isLoading || !inventoryData || !usageData}>
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
                            <>
                                <div className="flex justify-between items-center">
                                    <h3 className="font-medium">Inventory Alerts</h3>
                                    <Badge variant="outline">{object.alerts.length} Issues</Badge>
                                </div>

                                <div className="space-y-3">
                                    {object.alerts.map((alert: any, index: number) => (
                                        <div key={index} className="border rounded-lg p-3">
                                            <div className="flex items-start">
                                                <div
                                                    className={`p-2 rounded-full mr-3 ${alert.severity === "High"
                                                            ? "bg-red-100 text-red-500"
                                                            : alert.severity === "Medium"
                                                                ? "bg-yellow-100 text-yellow-500"
                                                                : "bg-blue-100 text-blue-500"
                                                        }`}
                                                >
                                                    <AlertTriangle className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center">
                                                        <h4 className="font-medium">{alert.title}</h4>
                                                        <Badge
                                                            variant={
                                                                alert.severity === "High"
                                                                    ? "destructive"
                                                                    : alert.severity === "Medium"
                                                                        ? "default"
                                                                        : "secondary"
                                                            }
                                                            className="ml-2"
                                                        >
                                                            {alert.severity}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>

                                                    <div className="mt-3 flex justify-between items-center">
                                                        <div className="text-sm">
                                                            <span className="text-muted-foreground">Affected Item: </span>
                                                            <span className="font-medium">{alert.item}</span>
                                                        </div>
                                                        <Button size="sm" variant="outline">
                                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                                            Order Now
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={generateRecommendations}
                    disabled={isLoading || !inventoryData || !usageData}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                    Refresh Analysis
                </Button>

                <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort by Priority
                </Button>
            </CardFooter>
        </Card>
    )
}

