import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { feedbackData, organizationId } = await req.json()

        // Early return if no feedback data
        if (!feedbackData || feedbackData.length === 0) {
            return NextResponse.json(
                {
                    error: "No feedback data provided",
                },
                { status: 400 },
            )
        }

        // Prepare the feedback data for analysis
        const feedbackText = feedbackData
            .map((item: any) => `Review date: ${item.date}, Rating: ${item.rating}, Comment: "${item.comment}"`)
            .join("\n\n")

        // Define the schema for sentiment analysis result
        const sentimentSchema = z.object({
            summary: z.string().describe("A brief summary of the overall customer feedback."),
            positive: z.number().describe("Count of positive feedback comments."),
            neutral: z.number().describe("Count of neutral feedback comments."),
            negative: z.number().describe("Count of negative feedback comments."),
            topKeywords: z.array(z.string()).describe("Top keywords or themes mentioned in the feedback."),
            sentimentBreakdown: z.object({
                serviceQuality: z.number().min(0).max(10).describe("Rating of service quality sentiment from 0-10."),
                staffProfessionalism: z
                    .number()
                    .min(0)
                    .max(10)
                    .describe("Rating of staff professionalism sentiment from 0-10."),
                valueForMoney: z.number().min(0).max(10).describe("Rating of value for money sentiment from 0-10."),
                timeliness: z.number().min(0).max(10).describe("Rating of timeliness sentiment from 0-10."),
            }),
            suggestedActions: z.array(z.string()).describe("Suggested actionable steps based on the feedback analysis."),
        })

        // Use AI SDK to analyze sentiment
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: sentimentSchema,
            prompt: `Analyze the following customer feedback for an auto detailing business.
        Categorize each piece of feedback as positive, neutral, or negative.
        Identify common themes and keywords.
        Break down sentiment across different aspects of the business.
        Suggest actionable steps to address any issues.
        
        Here's the feedback data:
        
        ${feedbackText}`,
        })

        return NextResponse.json(object)
    } catch (error) {
        console.error("Error in sentiment analysis:", error)
        return NextResponse.json({ error: "An error occurred during sentiment analysis" }, { status: 500 })
    }
}

