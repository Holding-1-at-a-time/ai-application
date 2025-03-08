import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { NextRequest } from "next/server"

// Define schema for pricing optimization
const pricingSchema = z.object({
    summary: z.string().describe("Summary of the pricing analysis and recommendations"),
    projectedRevenueImpact: z.number().describe("Projected percentage impact on revenue"),
    averagePriceChange: z.number().describe("Average price change across all services"),
    competitivePosition: z.string().describe("Competitive market position after changes"),
    services: z
        .array(
            z.object({
                id: z.string().describe("Service ID"),
                name: z.string().describe("Service name"),
                currentPrice: z.number().describe("Current price of the service"),
                recommendedPrice: z.number().describe("Recommended price of the service"),
                changePercentage: z.number().describe("Percentage change in price"),
                rationale: z.string().describe("Rationale for the price recommendation"),
            }),
        )
        .describe("Service pricing recommendations"),
})

export async function POST(req: NextRequest) {
    try {
        const { organizationId, services, appointmentData, optimizationLevel, applySeasonalPricing, selectedServices } =
            await req.json()

        // Filter services if specific ones are selected
        const servicesToOptimize = selectedServices
            ? services.filter((s: any) => selectedServices.includes(s._id))
            : services

        // Format the data for the AI
        const formattedServices = JSON.stringify(servicesToOptimize)
        const formattedAppointmentData = JSON.stringify(appointmentData)

        // Get current season
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth()
        let currentSeason = "spring"
        if (currentMonth >= 2 && currentMonth <= 4) {
          currentSeason = "spring"
        } else if (currentMonth >= 5 && currentMonth <= 7) {
                 currentSeason = "summer"
               } else if (currentMonth >= 8 && currentMonth <= 10) {
                        currentSeason = "fall"
                      } else {
                        currentSeason = "winter"
                      }

        // Generate pricing recommendations
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: pricingSchema,
            prompt: `You are an expert pricing strategist for an auto detailing business. Analyze the provided service and appointment data to recommend optimal pricing for each service.
      
      Services Data: ${formattedServices}
      Appointment Data: ${formattedAppointmentData}
      Optimization Level: ${optimizationLevel}% (higher values prioritize revenue maximization, lower values focus on competitive positioning)
      Apply Seasonal Pricing: ${applySeasonalPricing ? "Yes" : "No"}
      Current Season: ${currentSeason}
      
      Consider the following factors in your analysis:
      1. Historical booking patterns and service popularity
      2. Customer price sensitivity
      3. Seasonal demand fluctuations (if applicable)
      4. Service costs and profit margins
      5. Competitive market positioning
      
      For each service, recommend an optimal price and provide a clear rationale for the recommendation.
      Calculate the projected revenue impact, average price change, and competitive position after the recommended changes.`,
        })

        // Return the recommendations as JSON
        return new Response(JSON.stringify(object), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error generating pricing recommendations:", error)
        return new Response(JSON.stringify({ error: "Failed to generate pricing recommendations" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}

