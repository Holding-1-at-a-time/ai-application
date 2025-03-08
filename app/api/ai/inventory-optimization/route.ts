import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { NextRequest } from "next/server"

// Define schema for inventory optimization
const inventorySchema = z.object({
    summary: z.string().describe("Summary of the inventory optimization analysis"),
    projectedSavings: z.number().describe("Projected cost savings from optimization"),
    stockoutRiskReduction: z.number().describe("Percentage reduction in stockout risk"),
    inventoryEfficiency: z.number().describe("Percentage improvement in inventory efficiency"),
    items: z
        .array(
            z.object({
                id: z.string().describe("Item ID"),
                name: z.string().describe("Item name"),
                category: z.string().describe("Item category"),
                currentLevel: z.number().describe("Current inventory level"),
                unit: z.string().describe("Unit of measurement"),
                currentMinLevel: z.number().describe("Current minimum level"),
                currentOptimalLevel: z.number().describe("Current optimal level"),
                recommendedMinLevel: z.number().describe("Recommended minimum level"),
                recommendedOptimalLevel: z.number().describe("Recommended optimal level"),
                changePercentage: z.number().describe("Percentage change in levels"),
                rationale: z.string().describe("Rationale for the recommendation"),
            }),
        )
        .describe("Inventory items with optimization recommendations"),
    alerts: z
        .array(
            z.object({
                severity: z.enum(["High", "Medium", "Low"]).describe("Alert severity"),
                title: z.string().describe("Alert title"),
                description: z.string().describe("Alert description"),
                item: z.string().describe("Affected item name"),
            }),
        )
        .describe("Inventory alerts and issues"),
})

export async function POST(req: NextRequest) {
    try {
        const { organizationId, inventoryData, usageData } = await req.json()

        // Format the data for the AI
        const formattedInventoryData = JSON.stringify(inventoryData)
        const formattedUsageData = JSON.stringify(usageData)

        // Get current season
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        let currentSeason = "spring"
        if (currentMonth >= 2 && currentMonth <= 4) currentSeason = "spring"
        else if (currentMonth >= 5 && currentMonth <= 7) currentSeason = "summer"
        else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = "fall"
        else currentSeason = "winter"

        // Generate inventory recommendations
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: inventorySchema,
            prompt: `You are an expert inventory management specialist for an auto detailing business. Analyze the provided inventory and usage data to recommend optimal inventory levels for each item.
      
      Inventory Data: ${formattedInventoryData}
      Usage Data: ${formattedUsageData}
      Current Season: ${currentSeason}
      
      Consider the following factors in your analysis:
      1. Historical usage patterns and seasonality
      2. Lead time for restocking
      3. Storage costs and constraints
      4. Critical vs. non-critical items
      5. Bulk purchase discounts vs. carrying costs
      
      For each item, recommend optimal minimum and optimal inventory levels. Identify any alerts or issues that need immediate attention.
      Calculate projected cost savings, stockout risk reduction, and inventory efficiency improvements.`,
        })

        // Return the recommendations as JSON
        return new Response(JSON.stringify(object), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error generating inventory recommendations:", error)
        return new Response(JSON.stringify({ error: "Failed to generate inventory recommendations" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}

