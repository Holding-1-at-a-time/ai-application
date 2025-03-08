"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, AlertTriangle } from "lucide-react"

interface InventoryStatusProps {
    data: {
        items: {
            id: string
            name: string
            category: string
            currentLevel: number
            minLevel: number
            optimalLevel: number
            unit: string
            lastRestocked: string
            usageRate: number
        }[]
    }
}

export function InventoryStatus({ data }: InventoryStatusProps) {
    // Function to determine inventory status
    const getInventoryStatus = (current: number, min: number, optimal: number) => {
        if (current <= min) return "low"
        if (current < optimal) return "medium"
        return "good"
    }

    // Function to get badge variant based on status
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "low":
                return "destructive"
            case "medium":
                return "default"
            case "good":
                return "success"
            default:
                return "outline"
        }
    }

    // Function to get status label
    const getStatusLabel = (status: string) => {
        switch (status) {
            case "low":
                return "Low Stock"
            case "medium":
                return "Adequate"
            case "good":
                return "Optimal"
            default:
                return "Unknown"
        }
    }

    // Function to calculate percentage for progress bar
    const calculatePercentage = (current: number, optimal: number) => {
        return Math.min(Math.round((current / optimal) * 100), 100)
    }

    // Sort items by status (low stock first)
    const sortedItems = [...data.items].sort((a, b) => {
        const statusA = getInventoryStatus(a.currentLevel, a.minLevel, a.optimalLevel)
        const statusB = getInventoryStatus(b.currentLevel, b.minLevel, b.optimalLevel)

        if (statusA === "low" && statusB !== "low") return -1
        if (statusA !== "low" && statusB === "low") return 1
        return 0
    })

    return (
        <div className="space-y-4">
            <div className="border rounded-md">
                <div className="grid grid-cols-12 gap-4 p-3 bg-muted/50 font-medium text-sm">
                    <div className="col-span-4">Item</div>
                    <div className="col-span-3">Level</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-3">Action</div>
                </div>
                <div className="divide-y">
                    {sortedItems.map((item) => {
                        const status = getInventoryStatus(item.currentLevel, item.minLevel, item.optimalLevel)
                        const percentage = calculatePercentage(item.currentLevel, item.optimalLevel)

                        return (
                            <div key={item.id} className="grid grid-cols-12 gap-4 p-3 items-center">
                                <div className="col-span-4">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">{item.category}</div>
                                </div>
                                <div className="col-span-3">
                                    <div className="flex items-center space-x-2">
                                        <Progress value={percentage} className="h-2" />
                                        <span className="text-xs whitespace-nowrap">
                                            {item.currentLevel} {item.unit}
                                        </span>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Badge variant={getStatusVariant(status)}>
                                        {status === "low" && <AlertTriangle className="mr-1 h-3 w-3" />}
                                        {getStatusLabel(status)}
                                    </Badge>
                                </div>
                                <div className="col-span-3">
                                    <Button size="sm" variant={status === "low" ? "default" : "outline"} className="w-full">
                                        <ShoppingCart className="mr-2 h-3 w-3" />
                                        Reorder
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="flex justify-end">
                <Button variant="outline">View All Inventory</Button>
            </div>
        </div>
    )
}

