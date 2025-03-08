import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { historicalData, predictionType, predictionPeriod, organizationId } = await req.json()

        // Early return if no historical data
        if (!historicalData || historicalData.length === 0) {
            return NextResponse.json(
                {
                    error: "No historical data provided",
                },
                { status: 400 },
            )
        }

        // Prepare historical data
        const formattedData = JSON.stringify(historicalData, null, 2)

        // Define schema for prediction result
        const predictionSchema = z.object({
            summary: z.string().describe("A brief summary of the prediction results."),
            chartData: z
                .array(
                    z.object({
                        date: z.string().describe("The date in YYYY-MM format"),
                        historical: z.number().optional().describe("Historical value if available"),
                        predicted: z.number().describe("Predicted value"),
                    }),
                )
                .describe("Data for visualizing the prediction in a chart."),
            insights: z.array(z.string()).describe("Key insights from the prediction analysis."),
            recommendations: z.array(z.string()).describe("Recommended actions based on the prediction."),
            confidenceScore: z.number().min(0).max(1).describe("Confidence level of the prediction (0-1)."),
            limitingFactors: z.array(z.string()).describe("Factors that may limit prediction accuracy."),
        })

        // Generate prompt based on prediction type
        let prompt = ""
        switch (predictionType) {
            case "customer_retention":
                prompt = `Analyze the historical customer data and predict customer retention rates for the next ${predictionPeriod} months.`
                break
            case "service_demand":
                prompt = `Analyze the historical service booking data and predict service demand for the next ${predictionPeriod} months.`
                break
            case "revenue_forecast":
                prompt = `Analyze the historical revenue data and forecast revenue for the next ${predictionPeriod} months.`
                break
            default:
                prompt = `Analyze the historical data and make predictions for the next ${predictionPeriod} months.`
        }

        // Use AI SDK to generate prediction
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: predictionSchema,
            prompt: `${prompt}
        
        Generate predictions that include both the historical data points and the predicted future values.
        For the chart data, maintain the same date format as the historical data and ensure a smooth transition.
        Provide specific insights and actionable recommendations based on the patterns you identify.
        Include a confidence score and note any factors that might limit prediction accuracy.
        
        Here's the historical data:
        
        ${formattedData}`,
        })

        return NextResponse.json(object)
    } catch (error) {
        console.error("Error in prediction generation:", error)
        return NextResponse.json({ error: "An error occurred during prediction generation" }, { status: 500 })
    }
}

