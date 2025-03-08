"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface StaffPerformanceProps {
    data: {
        detailers: {
            id: string
            name: string
            image?: string
            efficiency: number
            customerSatisfaction: number
            servicesCompleted: number
            revenue: number
        }[]
    }
}

export function StaffPerformance({ data }: StaffPerformanceProps) {
    // Transform data for the chart
    const chartData = data.detailers.map((detailer) => ({
        name: detailer.name,
        efficiency: detailer.efficiency,
        satisfaction: detailer.customerSatisfaction,
        revenue: detailer.revenue / 1000, // Convert to thousands for better display
    }))

    return (
        <div className="space-y-6">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                            formatter={(value: number, name: string) => {
                                if (name === "revenue") return [`$${value}k`, "Revenue"]
                                return [value, name.charAt(0).toUpperCase() + name.slice(1)]
                            }}
                            contentStyle={{
                                backgroundColor: "hsl(var(--background))",
                                borderColor: "hsl(var(--border))",
                                borderRadius: "0.5rem",
                            }}
                        />
                        <Legend />
                        <Bar dataKey="efficiency" name="Efficiency" fill="hsl(var(--primary))" />
                        <Bar dataKey="satisfaction" name="Satisfaction" fill="hsl(var(--success))" />
                        <Bar dataKey="revenue" name="Revenue ($k)" fill="hsl(var(--secondary))" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.detailers.map((detailer) => (
                    <Card key={detailer.id}>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarImage src={detailer.image || "/placeholder.svg?height=40&width=40"} alt={detailer.name} />
                                    <AvatarFallback>{detailer.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{detailer.name}</p>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Badge variant="outline">{detailer.servicesCompleted} Services</Badge>
                                        <Badge variant="secondary">${detailer.revenue.toLocaleString()}</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

