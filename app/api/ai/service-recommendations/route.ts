import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { NextRequest } from "next/server"

// Define schema for service recommendations
const recommendationSchema = z.object({
    summary: z.string().describe("A brief summary of the vehicle's condition and service needs"),
    services: z
        .array(
            z.object({
                name: z.string().describe("Name of the recommended service"),
                reason: z.string().describe("Reason why this service is recommended"),
                priority: z.enum(["High", "Medium", "Low"]).describe("Priority level of this service"),
                price: z.number().describe("Estimated price of the service"),
                timeframe: z.string().describe("Recommended timeframe for this service"),
            }),
        )
        .describe("List of recommended services in priority order"),
    maintenanceTips: z.array(z.string()).describe("Maintenance tips specific to this vehicle"),
})

export async function POST(req: NextRequest) {
    try {
        const { messages, customerData, vehicleData, serviceHistory, availableServices } = await req.json()

        // Format the data for the AI
        const formattedVehicleData = vehicleData ? JSON.stringify(vehicleData) : "No vehicle data available"
        const formattedCustomerData = customerData ? JSON.stringify(customerData) : "No customer data available"
        const formattedServiceHistory = serviceHistory ? JSON.stringify(serviceHistory) : "No service history available"
        const formattedAvailableServices = availableServices
            ? JSON.stringify(availableServices)
            : "No service data available"

        // Get the last user message
        const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || ""

        // Generate recommendations
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: recommendationSchema,
            prompt: `You are an expert auto detailing service advisor. Based on the vehicle data, customer history, and available services, recommend the most appropriate detailing services.
      
      Vehicle Data: ${formattedVehicleData}
      Customer Data: ${formattedCustomerData}
      Service History: ${formattedServiceHistory}
      Available Services: ${formattedAvailableServices}
      
      Consider factors like:
      - Vehicle age, make, model, and condition
      - Time since last service
      - Seasonal factors (current season and weather conditions)
      - Customer preferences from past services
      - Complementary services that work well together
      
      Provide a concise summary and prioritized list of recommended services with clear reasons.
      ${lastUserMessage ? `Additional context: ${lastUserMessage}` : ""}`,
        })

        // Return the recommendations as JSON
        return new Response(JSON.stringify(object), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error generating service recommendations:", error)
        return new Response(JSON.stringify({ error: "Failed to generate recommendations" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}

