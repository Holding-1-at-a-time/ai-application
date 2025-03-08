import { openai } from "@ai-sdk/openai"
import { generateObject, streamText } from "ai"
import { z } from "zod"
import type { NextRequest } from "next/server"

// Define schema for staff coaching
const coachingSchema = z.object({
    detailerName: z.string().describe("Name of the detailer"),
    role: z.string().describe("Role of the detailer"),
    experienceLevel: z.string().describe("Experience level of the detailer"),
    performanceLevel: z.string().describe("Overall performance level assessment"),
    summary: z.string().describe("Summary of the detailer's performance"),
    metrics: z
        .object({
            efficiency: z.object({
                score: z.number().min(0).max(10).describe("Efficiency score out of 10"),
                summary: z.string().describe("Brief summary of efficiency performance"),
            }),
            quality: z.object({
                score: z.number().min(0).max(10).describe("Quality score out of 10"),
                summary: z.string().describe("Brief summary of quality performance"),
            }),
            customerSatisfaction: z.object({
                score: z.number().min(0).max(10).describe("Customer satisfaction score out of 10"),
                summary: z.string().describe("Brief summary of customer satisfaction performance"),
            }),
        })
        .describe("Key performance metrics"),
    detailedMetrics: z
        .array(
            z.object({
                name: z.string().describe("Name of the metric"),
                value: z.string().describe("Value of the metric"),
                teamAverage: z.string().describe("Team average for this metric"),
                percentile: z.number().min(0).max(100).describe("Percentile ranking within the team"),
                trend: z.enum(["up", "down", "stable"]).describe("Trend of this metric"),
            }),
        )
        .describe("Detailed performance metrics"),
    strengths: z.array(z.string()).describe("Detailer's strengths"),
    areasForImprovement: z.array(z.string()).describe("Areas where the detailer can improve"),
    coachingRecommendations: z
        .array(
            z.object({
                title: z.string().describe("Title of the coaching recommendation"),
                description: z.string().describe("Detailed description of the coaching recommendation"),
                priority: z.enum(["High", "Medium", "Low"]).describe("Priority of this recommendation"),
            }),
        )
        .describe("Coaching recommendations for the detailer"),
    developmentPlan: z
        .array(
            z.object({
                goal: z.string().describe("Development goal"),
                action: z.string().describe("Action to achieve the goal"),
                timeframe: z.string().describe("Timeframe for achieving the goal"),
            }),
        )
        .describe("Development plan for the detailer"),
})

export async function POST(req: NextRequest) {
    try {
        const { messages, detailerId, detailerData, organizationId } = await req.json()

        // Check if this is a follow-up question
        const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()
        const isFollowUp = messages.some((m: any) => m.role === "assistant" && m.content.startsWith("{"))

        if (isFollowUp && lastUserMessage && !lastUserMessage.content.startsWith("data:")) {
            // Handle follow-up questions with streaming response
            const result = streamText({
                model: openai("gpt-4o"),
                system: `You are an expert auto detailing staff coach. You have analyzed the performance data for a detailer and provided insights. 
        Now you are answering follow-up questions about your analysis and providing additional coaching advice.
        Be specific, actionable, and supportive in your responses. Focus on practical advice that can help improve performance.`,
                messages: messages.map((m: any) => ({
                    role: m.role,
                    content:
                        m.role === "assistant" && m.content.startsWith("{")
                            ? "Here's my analysis of the detailer's performance. Let me know if you have any questions or need specific coaching advice."
                            : m.content,
                })),
            })

            return result.toDataStreamResponse()
        }

        // Format the data for the AI
        const formattedDetailerData = JSON.stringify(detailerData)

        // Generate coaching insights
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: coachingSchema,
            prompt: `You are an expert auto detailing staff coach. Analyze the provided detailer performance data and generate coaching insights and recommendations.
      
      Detailer Data: ${formattedDetailerData}
      
      Focus on:
      1. Identifying key strengths and areas for improvement
      2. Providing specific, actionable coaching recommendations
      3. Creating a development plan with clear goals and timeframes
      4. Highlighting performance metrics relative to team averages
      
      Be supportive and constructive in your analysis, focusing on how the detailer can improve their skills and performance.`,
        })

        // Return the coaching insights as JSON
        return new Response(JSON.stringify(object), {
            headers: { "Content-Type": "application/json" },
        })
    } catch (error) {
        console.error("Error generating coaching insights:", error)
        return new Response(JSON.stringify({ error: "Failed to generate coaching insights" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}

