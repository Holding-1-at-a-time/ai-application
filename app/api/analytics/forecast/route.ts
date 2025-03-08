import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { historicalData, forecastPeriod } = await req.json()

        // Format the data for the AI prompt
        const formattedHistoricalData = JSON.stringify(historicalData, null, 2)

        // Create the prompt for revenue forecasting
        const prompt = `
      You are an AI financial analyst for an auto detailing business. Generate a revenue forecast based on the following historical data.
      
      Historical revenue data:
      ${formattedHistoricalData}
      
      Please generate a revenue forecast for the next ${forecastPeriod} months. Consider:
      1. Seasonal patterns in the historical data
      2. Overall growth or decline trends
      3. Potential outliers in the historical data
      
      For each forecasted month, provide:
      1. The forecasted revenue
      2. A confidence score (0-1)
      3. Key factors influencing the forecast
      
      Also provide:
      1. Overall growth projection for the forecast period
      2. Key risks to the forecast
      3. Recommendations based on the forecast
      
      Format your response as JSON with the following structure:
      {
        "forecastPeriod": ${forecastPeriod},
        "startDate": "YYYY-MM-DD", // First day of forecast period
        "endDate": "YYYY-MM-DD", // Last day of forecast period
        "overallGrowth": 0.00, // Projected growth rate for the period
        "monthlyForecasts": [
          {
            "month": "YYYY-MM",
            "revenue": 0,
            "confidence": 0.0,
            "factors": ["Factor 1", "Factor 2"]
          }
        ],
        "risks": [
          { "risk": "Risk description", "impact": "high/medium/low", "mitigation": "Suggested mitigation" }
        ],
        "recommendations": [
          { "title": "Recommendation", "description": "Detailed description" }
        ]
      }
    `

        // Generate forecast using AI
        const { text } = await generateText({
            model: openai("gpt-4o"),
            prompt: prompt,
        })

        // Parse the AI response
        let forecast
        try {
            // Extract JSON from the response (in case the AI includes additional text)
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                forecast = JSON.parse(jsonMatch[0])
            } else {
                forecast = JSON.parse(text)
            }
        } catch (error) {
            console.error("Failed to parse AI response:", error)
            return NextResponse.json({ error: "Failed to parse forecast" }, { status: 500 })
        }

        return NextResponse.json(forecast)
    } catch (error) {
        console.error("Error generating forecast:", error)
        return NextResponse.json({ error: "Failed to generate forecast" }, { status: 500 })
    }
}

