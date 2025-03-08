import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import type { NextRequest } from "next/server"

// Define schema for vehicle inspection results
const inspectionSchema = z.object({
    summary: z.string().describe("A brief summary of the vehicle's condition"),
    goodCondition: z.array(z.string()).describe("Areas of the vehicle that are in good condition"),
    needsAttention: z.array(z.string()).describe("Areas that need attention but aren't critical"),
    issues: z.array(z.string()).describe("Issues that need immediate attention"),
    recommendedServices: z
        .array(
            z.object({
                name: z.string().describe("Name of the recommended service"),
                priority: z.enum(["High", "Medium", "Low"]).describe("Priority level of this service"),
            }),
        )
        .describe("Services recommended based on the inspection"),
    estimatedCost: z.string().describe("Estimated cost range for recommended services"),
    notes: z.string().describe("Additional notes about the vehicle condition"),
})

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const messages = JSON.parse(formData.get("messages") as string)
        const appointmentId = formData.get("appointmentId") as string
        const vehicleId = formData.get("vehicleId") as string

        // Get the image from the last user message
        const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()

        if (!lastUserMessage || !lastUserMessage.content.startsWith("data:image")) {
            return new Response(JSON.stringify({ error: "No image provided" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            })
        }

        // Generate analysis
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: inspectionSchema,
            prompt: `You are an expert auto detailing inspector. Analyze the provided image of a vehicle and identify its condition, issues, and recommended services.
      
      Focus on:
      1. Paint condition (scratches, swirl marks, oxidation)
      2. Interior condition (if visible)
      3. Wheels and tires
      4. Trim and exterior details
      5. Glass and windows
      
      Provide a detailed assessment categorized by good conditions, areas needing attention, and issues requiring immediate service.
      Recommend appropriate detailing services based on your findings.`,
            images: [lastUserMessage.content],
        })

        // Return the analysis as JSON
        return new Response(JSON.stringify(object), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error analyzing vehicle image:", error)
        return new Response(JSON.stringify({ error: "Failed to analyze vehicle image" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}

