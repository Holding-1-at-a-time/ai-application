import { openai } from "@ai-sdk/openai"
import { generateText, streamText } from "ai"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { query, businessData, conversationHistory = [], stream = true } = await req.json()

        // Format the business data for context
        const formattedBusinessData = JSON.stringify(businessData, null, 2)

        // Format the conversation history
        const formattedHistory = conversationHistory
            .map((message: any) => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`)
            .join("\n\n")

        // Create the system prompt
        const systemPrompt = `You are a business intelligence assistant for an auto detailing business. 
    You have access to the following business data:
    
    ${formattedBusinessData}
    
    Use this data to provide accurate, helpful, and actionable answers to business questions.
    Always be specific and data-driven in your responses. When possible, include specific metrics, 
    trends, and actionable recommendations based on the data.
    
    If asked about data that's not available to you, politely explain that you don't have that information
    and suggest alternative insights you can provide based on the available data.
    
    For complex questions, break down your analysis step by step.`

        // Handle streaming or non-streaming response based on the request
        if (stream) {
            // Streaming response
            const result = streamText({
                model: openai("gpt-4o"),
                system: systemPrompt,
                prompt: formattedHistory ? `${formattedHistory}\n\nUser: ${query}` : query,
            })

            return result.toDataStreamResponse()
        } else {
            // Non-streaming response
            const { text } = await generateText({
                model: openai("gpt-4o"),
                system: systemPrompt,
                prompt: formattedHistory ? `${formattedHistory}\n\nUser: ${query}` : query,
            })

            return new Response(JSON.stringify({ text }), {
                headers: { "Content-Type": "application/json" },
            })
        }
    } catch (error) {
        console.error("Error in business assistant:", error)
        return new Response(JSON.stringify({ error: "An error occurred processing your query" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        })
    }
}

