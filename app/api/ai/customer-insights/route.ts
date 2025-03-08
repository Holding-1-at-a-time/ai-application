import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { NextRequest } from "next/server"

// Define schema for customer insights
const customerInsightsSchema = z.object({
    keyMetrics: z
        .array(
            z.object({
                name: z.string().describe("Name of the metric"),
                value: z.string().describe("Current value of the metric"),
                change: z.number().describe("Percentage change from previous period"),
                description: z.string().describe("Brief description or insight about this metric"),
            }),
        )
        .describe("Key customer metrics"),

    keyInsights: z.array(z.string()).describe("Key insights about customer behavior and patterns"),

    customerSegments: z
        .array(
            z.object({
                name: z.string().describe("Name of the customer segment"),
                percentage: z.number().describe("Percentage of customers in this segment"),
                description: z.string().describe("Description of this customer segment"),
                characteristics: z.array(z.string()).describe("Key characteristics of this segment"),
            }),
        )
        .describe("Customer segments identified in the data"),

    trends: z
        .array(
            z.object({
                name: z.string().describe("Name of the trend"),
                direction: z.enum(["up", "down", "stable"]).describe("Direction of the trend"),
                value: z.string().describe("Value or percentage of the trend"),
                strength: z.number().min(0).max(100).describe("Strength of the trend as a percentage"),
                description: z.string().describe("Description of the trend"),
            }),
        )
        .describe("Customer behavior trends"),

    recommendations: z
        .array(
            z.object({
                title: z.string().describe("Title of the recommendation"),
                description: z.string().describe("Detailed description of the recommendation"),
                impact: z.enum(["High", "Medium", "Low"]).describe("Potential impact of implementing this recommendation"),
                effort: z.enum(["High", "Medium", "Low"]).describe("Effort required to implement this recommendation"),
            }),
        )
        .describe("Recommended actions based on customer insights"),
})

export async function POST(req: NextRequest) {
    try {
        const { organizationId, customerData, appointmentData } = await req.json()

        // Format the data for the AI
        const formattedCustomerData = JSON.stringify(customerData)
        const formattedAppointmentData = JSON.stringify(appointmentData)

        // Generate insights
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: customerInsightsSchema,
            prompt: `You are an expert customer analytics advisor for an auto detailing business. Analyze the provided customer and appointment data to generate insights, identify segments, and recommend actions.
      
      Customer Data: ${formattedCustomerData}
      Appointment Data: ${formattedAppointmentData}
      
      Focus on:
      1. Identifying meaningful customer segments based on spending, frequency, vehicle types, and service preferences
      2. Detecting trends in customer behavior over time
      3. Highlighting opportunities for customer retention and revenue growth
      4. Providing actionable recommendations that the business can implement
      
      Be specific, data-driven, and provide insights that would be valuable for an auto detailing business.`,
        })

        // Return the insights as JSON
        return new Response(JSON.stringify(object), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error generating customer insights:", error)
        return new Response(JSON.stringify({ error: "Failed to generate customer insights" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}