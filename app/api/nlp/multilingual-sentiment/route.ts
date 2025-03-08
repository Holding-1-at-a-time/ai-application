import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { feedback, originalLanguage = null } = await req.json()

        if (!feedback) {
            return NextResponse.json({ error: "No feedback text provided for analysis" }, { status: 400 })
        }

        // Define our schema for multilingual sentiment analysis
        const sentimentSchema = z.object({
            language: z.object({
                detected: z.string().describe("The detected language of the feedback"),
                code: z.string().describe("ISO language code"),
                confidence: z.number().min(0).max(1).describe("Confidence score of language detection"),
            }),
            sentiment: z.object({
                score: z.number().min(-1).max(1).describe("Sentiment score from -1 (very negative) to 1 (very positive)"),
                label: z.string().describe("Sentiment label: 'positive', 'negative', or 'neutral'"),
                confidence: z.number().min(0).max(1).describe("Confidence score of sentiment analysis"),
            }),
            topics: z
                .array(
                    z.object({
                        name: z.string().describe("Identified topic in the feedback"),
                        sentiment: z.number().min(-1).max(1).describe("Topic-specific sentiment score"),
                    }),
                )
                .describe("Topics identified in the feedback with their sentiment scores"),
            translation: z.object({
                english: z.string().describe("Translation of the feedback to English, if original is non-English"),
                isTranslated: z.boolean().describe("Whether the feedback was translated"),
            }),
            key_points: z.array(z.string()).describe("Key points extracted from the feedback"),
            actionable_feedback: z.boolean().describe("Whether the feedback contains actionable information"),
        })

        // Generate sentiment analysis using AI
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: sentimentSchema,
            prompt: `Analyze the sentiment, topics, and key points of the following customer feedback for an auto detailing business.
        Detect the language of the feedback and translate it to English if it's not already in English.
        
        Feedback: ${feedback}
        ${originalLanguage ? `Original language (if known): ${originalLanguage}` : ""}
        
        Provide detailed sentiment analysis including overall sentiment and topic-specific sentiments.
        Extract key points and determine if the feedback contains actionable information.`,
        })

        return NextResponse.json(object)
    } catch (error) {
        console.error("Error in multilingual sentiment analysis:", error)
        return NextResponse.json({ error: "An error occurred during multilingual sentiment analysis" }, { status: 500 })
    }
}

