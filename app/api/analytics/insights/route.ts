import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { appointmentsData, metricsData, analysisType } = await req.json()

        // Format the data for the AI prompt
        const formattedAppointments = JSON.stringify(appointmentsData, null, 2)
        const formattedMetrics = JSON.stringify(metricsData, null, 2)

        // Create the prompt based on analysis type
        let prompt = ""

        if (analysisType === "general") {
            prompt = `
        You are an AI business analyst for an auto detailing business. Analyze the following data and provide actionable business insights.
        
        Current business metrics:
        ${formattedMetrics}
        
        Recent appointment data (sample of ${appointmentsData.length} appointments):
        ${formattedAppointments}
        
        Please provide the following insights:
        1. A summary of the current business performance
        2. Key trends you observe in the data
        3. 3-5 actionable recommendations to improve business performance
        4. Any potential issues or opportunities you identify
        
        Format your response as JSON with the following structure:
        {
          "summary": "Summary text here...",
          "trends": [
            { "name": "Trend name", "description": "Description of trend", "impact": "high/medium/low" }
          ],
          "recommendations": [
            { "title": "Recommendation title", "description": "Detailed description", "priority": "high/medium/low" }
          ],
          "opportunities": [
            { "title": "Opportunity title", "description": "Description of opportunity" }
          ]
        }
      `
        } else if (analysisType === "scheduling") {
            prompt = `
        You are an AI business analyst for an auto detailing business. Analyze the following appointment data and provide insights on scheduling optimization.
        
        Current business metrics:
        ${formattedMetrics}
        
        Recent appointment data (sample of ${appointmentsData.length} appointments):
        ${formattedAppointments}
        
        Please provide the following insights:
        1. Analysis of current scheduling patterns
        2. Peak booking times and days
        3. Recommendations for optimizing scheduling
        4. Suggestions for reducing cancellations or no-shows
        
        Format your response as JSON with the following structure:
        {
          "schedulingPatterns": "Analysis of scheduling patterns...",
          "peakTimes": {
            "days": ["Monday", "Friday"],
            "timeSlots": ["9:00-11:00", "14:00-16:00"],
            "analysis": "Analysis of why these are peak times..."
          },
          "optimizationSuggestions": [
            { "title": "Suggestion title", "description": "Detailed description", "impact": "high/medium/low" }
          ],
          "cancellationReduction": [
            { "strategy": "Strategy name", "description": "How to implement", "expectedImpact": "Description of impact" }
          ]
        }
      `
        } else if (analysisType === "services") {
            prompt = `
        You are an AI business analyst for an auto detailing business. Analyze the following data and provide insights on service performance and optimization.
        
        Current business metrics:
        ${formattedMetrics}
        
        Recent appointment data (sample of ${appointmentsData.length} appointments):
        ${formattedAppointments}
        
        Please provide the following insights:
        1. Analysis of service popularity and profitability
        2. Recommendations for service pricing optimization
        3. Suggestions for new services or packages based on current data
        4. Strategies to increase average order value
        
        Format your response as JSON with the following structure:
        {
          "serviceAnalysis": [
            { "serviceName": "Service name", "popularity": "high/medium/low", "profitability": "high/medium/low", "notes": "Additional insights" }
          ],
          "pricingRecommendations": [
            { "serviceName": "Service name", "currentPrice": 0, "recommendedPrice": 0, "rationale": "Explanation for recommendation" }
          ],
          "newServiceSuggestions": [
            { "name": "Suggested service name", "description": "Service description", "estimatedPrice": 0, "targetMarket": "Description of target customers" }
          ],
          "aovStrategies": [
            { "strategy": "Strategy name", "implementation": "How to implement", "expectedImpact": "Description of impact" }
          ]
        }
      `
        }

        // Generate insights using AI
        const { text } = await generateText({
            model: openai("gpt-4o"),
            prompt: prompt,
        })

        // Parse the AI response
        let insights
        try {
            // Extract JSON from the response (in case the AI includes additional text)
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                insights = JSON.parse(jsonMatch[0])
            } else {
                insights = JSON.parse(text)
            }
        } catch (error) {
            console.error("Failed to parse AI response:", error)
            return NextResponse.json({ error: "Failed to parse insights" }, { status: 500 })
        }

        return NextResponse.json(insights)
    } catch (error) {
        console.error("Error generating insights:", error)
        return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
    }
}

