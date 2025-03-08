"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CustomerRetentionProps {
    data: {
        month: string
        newCustomers: number
        returningCustomers: number
        retentionRate: number
    }[]
}

export function CustomerRetention({ data }: CustomerRetentionProps) {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis yAxisId="left" className="text-xs" />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} className="text-xs" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "0.5rem",
                        }}
                    />
                    <Legend />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="newCustomers"
                        name="New Customers"
                        stroke="hsl(var(--primary))"
                        activeDot={{ r: 8 }}
                    />
                    <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="returningCustomers"
                        name="Returning Customers"
                        stroke="hsl(var(--secondary))"
                    />
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="retentionRate"
                        name="Retention Rate (%)"
                        stroke="hsl(var(--success))"
                        strokeDasharray="5 5"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

