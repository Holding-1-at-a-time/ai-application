import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { beforeImageUrl, afterImageUrl, serviceId } = await req.json()

        // Validate input
        if (!beforeImageUrl || !afterImageUrl) {
            return NextResponse.json(
                {
                    error: "Both before and after image URLs are required",
                },
                { status: 400 },
            )
        }

        // Define schema for analysis result
        const analysisSchema = z.object({
            qualityScore: z
                .number()
                .min(0)
                .max(10)
                .describe(
                    "Quality score from 0-10 based on the improvement shown in the after image compared to the before image.",
                ),
            improvements: z.array(z.string()).describe("List of improvements detected between the before and after images."),
            detectedIssues: z
                .array(z.string())
                .describe("List of issues detected in the before image that were addressed in the after image."),
            detectedComponents: z.array(z.string()).describe("List of car components detected in the images."),
            summary: z.string().describe("A summary of the service quality based on the before and after images."),
        })

        // Use AI SDK to analyze images
        const { object } = await generateObject({
            model: openai("gpt-4o"),
            schema: analysisSchema,
            prompt: `Analyze these before and after images of an auto detailing service.
        
        Before Image URL: ${beforeImageUrl}
        After Image URL: ${afterImageUrl}
        
        Compare the before and after images to:
        1. Assess the quality of the detailing service
        2. Identify specific improvements made
        3. Detect issues that were addressed
        4. Identify car components visible in the images
        5. Provide an overall summary of the service quality
        
        Focus on aspects like cleanliness, shine, scratch removal, stain removal, and overall appearance.
        Be specific about what was improved and what issues were addressed.
        Provide a quality score from 0-10 where 10 is perfect detailing work.`,
            vision: {
                imageUrls: [beforeImageUrl, afterImageUrl],
            },
        })

        return NextResponse.json(object)
    } catch (error) {
        console.error("Error in image analysis:", error)
        return NextResponse.json({ error: "An error occurred during image analysis" }, { status: 500 })
    }
}

