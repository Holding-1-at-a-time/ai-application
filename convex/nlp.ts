import { v } from "convex/values"
import { query, mutation, action } from "./_generated/server"
import { internal } from "./_generated/api"

// Store result of entity recognition
export const storeEntityRecognition = mutation({
    args: {
        organizationId: v.string(),
        text: v.string(),
        entities: v.object({
            carModels: v.array(
                v.object({
                    name: v.string(),
                    brand: v.optional(v.string()),
                    confidence: v.number(),
                }),
            ),
            serviceTypes: v.array(
                v.object({
                    name: v.string(),
                    category: v.optional(v.string()),
                    confidence: v.number(),
                }),
            ),
            dates: v.array(
                v.object({
                    value: v.string(),
                    type: v.string(),
                    confidence: v.number(),
                }),
            ),
            locations: v.array(
                v.object({
                    value: v.string(),
                    confidence: v.number(),
                }),
            ),
        }),
        language: v.object({
            detected: v.string(),
            confidence: v.number(),
        }),
        summary: v.string(),
        source: v.string(), // e.g., "feedback", "chat", "email"
        sourceId: v.optional(v.string()), // reference to the source document
    },
    handler: async (ctx, args) => {
        const { organizationId, text, entities, language, summary, source, sourceId } = args

        // Ensure user has access to this organization
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user || user.organizationId !== organizationId) {
            throw new Error("Unauthorized: User does not have access to this organization")
        }

        return await ctx.db.insert("entityRecognition", {
            organizationId,
            text,
            entities,
            language,
            summary,
            source,
            sourceId,
            createdAt: new Date().toISOString(),
            createdBy: user._id,
        })
    },
})

// Process text for entity recognition
export const processTextForEntities = action({
    args: {
        organizationId: v.string(),
        text: v.string(),
        source: v.string(),
        sourceId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { organizationId, text, source, sourceId } = args

        // Ensure user has access to this organization
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        try {
            // Call the entity recognition API
            const response = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/nlp/entity-recognition`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text,
                }),
            })

            if (!response.ok) {
                throw new Error(`Entity recognition API responded with status: ${response.status}`)
            }

            const result = await response.json()

            // Store the result in the database
            await ctx.runMutation(internal.nlp.storeEntityRecognition, {
                organizationId,
                text,
                entities: result.entities,
                language: result.language,
                summary: result.summary,
                source,
                sourceId,
            })

            return result
        } catch (error) {
            console.error("Error processing text for entities:", error)
            throw new Error("Failed to process text for entity recognition")
        }
    },
})

// Process feedback for multilingual sentiment analysis
export const processFeedbackMultilingual = action({
    args: {
        organizationId: v.string(),
        feedback: v.string(),
        feedbackId: v.optional(v.string()),
        originalLanguage: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { organizationId, feedback, feedbackId, originalLanguage } = args

        // Ensure user has access to this organization
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        try {
            // Call the multilingual sentiment analysis API
            const response = await fetch(
                `${process.env.VERCEL_URL || "http://localhost:3000"}/api/nlp/multilingual-sentiment`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        feedback,
                        originalLanguage,
                    }),
                },
            )

            if (!response.ok) {
                throw new Error(`Multilingual sentiment API responded with status: ${response.status}`)
            }

            const result = await response.json()

            // Store the sentiment analysis result
            const sentimentId = await ctx.runMutation(internal.nlp.storeSentimentAnalysis, {
                organizationId,
                feedbackId,
                feedback,
                language: result.language,
                sentiment: result.sentiment,
                topics: result.topics,
                translation: result.translation,
                keyPoints: result.key_points,
                actionableFeedback: result.actionable_feedback,
            })

            // Process for entity recognition if needed
            if (result.translation.isTranslated) {
                // Process the English translation for entities
                await ctx.runAction(internal.nlp.processTextForEntities, {
                    organizationId,
                    text: result.translation.english,
                    source: "feedback",
                    sourceId: feedbackId,
                })
            } else {
                // Process the original feedback for entities
                await ctx.runAction(internal.nlp.processTextForEntities, {
                    organizationId,
                    text: feedback,
                    source: "feedback",
                    sourceId: feedbackId,
                })
            }

            return { result, sentimentId }
        } catch (error) {
            console.error("Error processing multilingual feedback:", error)
            throw new Error("Failed to process multilingual feedback")
        }
    },
})

// Store multilingual sentiment analysis
export const storeSentimentAnalysis = mutation({
    args: {
        organizationId: v.string(),
        feedbackId: v.optional(v.string()),
        feedback: v.string(),
        language: v.object({
            detected: v.string(),
            code: v.string(),
            confidence: v.number(),
        }),
        sentiment: v.object({
            score: v.number(),
            label: v.string(),
            confidence: v.number(),
        }),
        topics: v.array(
            v.object({
                name: v.string(),
                sentiment: v.number(),
            }),
        ),
        translation: v.object({
            english: v.string(),
            isTranslated: v.boolean(),
        }),
        keyPoints: v.array(v.string()),
        actionableFeedback: v.boolean(),
    },
    handler: async (ctx, args) => {
        const {
            organizationId,
            feedbackId,
            feedback,
            language,
            sentiment,
            topics,
            translation,
            keyPoints,
            actionableFeedback,
        } = args

        // Ensure user has access to this organization
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user || user.organizationId !== organizationId) {
            throw new Error("Unauthorized: User does not have access to this organization")
        }

        return await ctx.db.insert("sentimentAnalysis", {
            organizationId,
            feedbackId,
            feedback,
            language,
            sentiment,
            topics,
            translation,
            keyPoints,
            actionableFeedback,
            createdAt: new Date().toISOString(),
            createdBy: user._id,
        })
    },
})

// Get recent entity recognitions
export const getRecentEntityRecognitions = query({
    args: {
        organizationId: v.string(),
        limit: v.optional(v.number()),
        source: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { organizationId, limit = 10, source } = args

        // Ensure user has access to this organization
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user || user.organizationId !== organizationId) {
            throw new Error("Unauthorized: User does not have access to this organization")
        }

        let query = ctx.db
            .query("entityRecognition")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))

        if (source) {
            query = query.filter((q) => q.eq(q.field("source"), source))
        }

        return await query.order("desc").take(limit)
    },
})

// Get recent sentiment analyses
export const getRecentSentimentAnalyses = query({
    args: {
        organizationId: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { organizationId, limit = 10 } = args

        // Ensure user has access to this organization
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user || user.organizationId !== organizationId) {
            throw new Error("Unauthorized: User does not have access to this organization")
        }

        return await ctx.db
            .query("sentimentAnalysis")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .order("desc")
            .take(limit)
    },
})

