import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { businessData, timeframe, focusAreas = [], audienceType = "executive" } = await req.json()

        if (!businessData || !timeframe) {
            return NextResponse.json({ error: "Missing required data for report generation" }, { status: 400 })
        }

        // Define the schema for our executive summary report
        const reportSchema = z.object({
            title: z.string().describe("Report title including the timeframe"),
            summary: z.string().describe("Executive summary of key business insights"),
            key_metrics: z
                .array(
                    z.object({
                        name: z.string().describe("Metric name"),
                        value: z.string().describe("Current value"),
                        change: z.string().describe("Change from previous period with percentage"),
                        trend: z.string().describe("'up', 'down', or 'stable'"),
                        insight: z.string().describe("Brief insight about this metric"),
                    }),
                )
                .describe("Key business metrics and their trends"),
            highlights: z
                .array(
                    z.object({
                        title: z.string().describe("Highlight title"),
                        description: z.string().describe("Detailed description of the highlight"),
                        category: z.string().describe("Category of the highlight (e.g., 'revenue', 'operations', 'customers')"),
                    }),
                )
                .describe("Business highlights from the period"),
            challenges: z
                .array(
                    z.object({
                        title: z.string().describe("Challenge title"),
                        description: z.string().describe("Description of the challenge"),
                        potentialImpact: z.string().describe("Potential impact if not addressed"),
                        recommendedAction: z.string().describe("Recommended action to address the challenge"),
                    }),
                )
                .describe("Business challenges identified"),
            opportunities: z
                .array(
                    z.object({
                        title: z.string().describe("Opportunity title"),
                        description: z.string().describe("Description of the opportunity"),
                        potentialBenefit: z.string().describe("Potential benefit if pursued"),
                        recommendedAction: z.string().describe("Recommended action to capitalize on the opportunity"),
                    }),
                )
                .describe("Business opportunities identified"),
            nextSteps: z.array(z.string()).describe("Recommended next steps"),
            appendix: z.object({
                dataSourcesUsed: z.array(z.string()).describe("Data sources used in this report"),
                generatedAt: z.string().describe("Timestamp when the report was generated"),
            }),
        })

        // Format the business data for the AI
        const formattedData = JSON.stringify(businessData, null, 2)
        const focusAreasText =
            focusAreas.length > 0
                ? `Focus especially on these areas: ${focusAreas.join(", ")}.`
                : "Provide a balanced overview of all business areas."

        // Generate the report using AI
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: reportSchema,
            prompt: `Generate an executive summary report for an auto detailing business based on the provided data.
        The report should cover the ${timeframe} timeframe.
        ${focusAreasText}
        Tailor the report for a ${audienceType} audience.
        
        Identify key metrics, highlights, challenges, and opportunities.
        Provide actionable next steps based on the insights.
        Be specific and data-driven in your analysis.
        
        Business data:
        ${formattedData}`,
        })

        // Add generation timestamp if not included
        if (!object.appendix.generatedAt) {
            object.appendix.generatedAt = new Date().toISOString()
        }

        return NextResponse.json(object)
    } catch (error) {
        console.error("Error generating executive report:", error)
        return NextResponse.json({ error: "An error occurred during report generation" }, { status: 500 })
    }
}

