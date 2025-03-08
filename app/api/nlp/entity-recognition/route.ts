import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { text, language = "en" } = await req.json()

        if (!text) {
            return NextResponse.json({ error: "No text provided for entity recognition" }, { status: 400 })
        }

        // Define our schema for entity recognition results
        const entitySchema = z.object({
            entities: z.object({
                carModels: z
                    .array(
                        z.object({
                            name: z.string().describe("Name of the car model mentioned"),
                            brand: z.string().optional().describe("Brand of the car if mentioned"),
                            confidence: z.number().min(0).max(1).describe("Confidence score of this entity detection"),
                        }),
                    )
                    .describe("Car models identified in the text"),
                serviceTypes: z
                    .array(
                        z.object({
                            name: z.string().describe("Name of the service type mentioned"),
                            category: z.string().optional().describe("Category of service if detectable"),
                            confidence: z.number().min(0).max(1).describe("Confidence score of this entity detection"),
                        }),
                    )
                    .describe("Auto detailing service types identified in the text"),
                dates: z
                    .array(
                        z.object({
                            value: z.string().describe("The date mentioned in ISO format when possible or as raw text"),
                            type: z.string().describe("The type of date, e.g., 'appointment', 'deadline', 'reminder'"),
                            confidence: z.number().min(0).max(1).describe("Confidence score of this entity detection"),
                        }),
                    )
                    .describe("Dates identified in the text"),
                locations: z
                    .array(
                        z.object({
                            value: z.string().describe("The location mentioned"),
                            confidence: z.number().min(0).max(1).describe("Confidence score of this entity detection"),
                        }),
                    )
                    .describe("Locations identified in the text"),
            }),
            language: z.object({
                detected: z.string().describe("The detected language of the input text"),
                confidence: z.number().min(0).max(1).describe("Confidence score of language detection"),
            }),
            summary: z.string().describe("Brief summary of what the text is about in relation to auto detailing"),
        })

        // Generate structured entities using AI
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: entitySchema,
            prompt: `Extract car models, service types, dates, and locations from the following text related to auto detailing. 
      Also detect the language of the text.
      
      Text: ${text}
      
      Identify car models with brands when possible. For service types, categorize them if the category is clear.
      For dates, convert to ISO format when possible and identify the type of date.
      Determine if the text is not in English and what language it might be in.
      Provide a brief summary of what the text is about in relation to auto detailing.`,
        })

        return NextResponse.json(object)
    } catch (error) {
        console.error("Error in entity recognition:", error)
        return NextResponse.json({ error: "An error occurred during entity recognition" }, { status: 500 })
    }
}

