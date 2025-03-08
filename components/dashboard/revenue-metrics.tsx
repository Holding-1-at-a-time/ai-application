"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

interface RevenueMetricsProps {
    data: {
        byService: {
            name: string
            revenue: number
            previousRevenue: number
            change: number
        }[]
        byMonth: {
            name: string
            revenue: number
            expenses: number
            profit: number
        }[]
        byCustomerType: {
            name: string
            newCustomers: number
            returningCustomers: number
        }[]
    }
}

export function RevenueMetrics({ data }: RevenueMetricsProps) {
    return (
        <Tabs defaultValue="by-service" className="space-y-4">
            <TabsList>
                <TabsTrigger value="by-service">By Service</TabsTrigger>
                <TabsTrigger value="by-month">By Month</TabsTrigger>
                <TabsTrigger value="by-customer">By Customer Type</TabsTrigger>
            </TabsList>

            <TabsContent value="by-service" className="space-y-4">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data.byService}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                formatter={(value: number) => [`$${value}`, "Revenue"]}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Legend />
                            +<Bar dataKey="revenue" name="Current Revenue" fill="var(--color-primary)" />

                            <Bar dataKey="previousRevenue" name="Previous Period" fill="hsl(var(--muted))" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.byService.slice(0, 3).map((service) => (
                        <Card key={service.name}>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">{service.name}</p>
                                    <p className="text-2xl font-bold">${service.revenue.toLocaleString()}</p>
                                    <div className="flex items-center">
                                        <span
                                            className={`text-xs ${service.change > 0 ? "text-green-500" : service.change < 0 ? "text-red-500" : "text-gray-500"}`}
                                        >
                                            {service.change > 0 ? "+" : ""}
                                            {service.change}% from previous period
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="by-month">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data.byMonth}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                formatter={(value: number) => [`$${value}`, ""]}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                name="Revenue"
                                stroke="hsl(var(--primary))"
                                fill="hsl(var(--primary))"
                                fillOpacity={0.3}
                            />
                            <Area
                                type="monotone"
                                dataKey="expenses"
                                name="Expenses"
                                stroke="hsl(var(--destructive))"
                                fill="hsl(var(--destructive))"
                                fillOpacity={0.3}
                            />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                name="Profit"
                                stroke="hsl(var(--success))"
                                fill="hsl(var(--success))"
                                fillOpacity={0.3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </TabsContent>

            <TabsContent value="by-customer">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                            data={data.byCustomerType}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                formatter={(value: number) => [`$${value}`, ""]}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="newCustomers"
                                name="New Customers"
                                stroke="hsl(var(--primary))"
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="returningCustomers"
                                name="Returning Customers"
                                stroke="hsl(var(--secondary))"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </TabsContent>
        </Tabs>
    )
}

