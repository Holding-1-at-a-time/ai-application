import { v } from "convex/values"
import { query, mutation, action } from "./_generated/server"
import { internal } from "./_generated/api"

// Store a conversation with the business assistant
export const storeConversation = mutation({
    args: {
        organizationId: v.string(),
        title: v.string(),
        initialQuery: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId, title, initialQuery } = args

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

        return await ctx.db.insert("assistantConversations", {
            organizationId,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: user._id,
            messages: [
                {
                    role: "user",
                    content: initialQuery,
                    timestamp: new Date().toISOString(),
                },
            ],
            isArchived: false,
        })
    },
})

// Add message to conversation
export const addMessageToConversation = mutation({
    args: {
        conversationId: v.id("assistantConversations"),
        message: v.object({
            role: v.string(),
            content: v.string(),
        }),
    },
    handler: async (ctx, args) => {
        const { conversationId, message } = args

        // Ensure user has access to this conversation
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user) {
            throw new Error("Unauthorized: User not found")
        }

        // Get the conversation
        const conversation = await ctx.db.get(conversationId)
        if (!conversation) {
            throw new Error("Conversation not found")
        }

        // Check if user has access to the conversation's organization
        if (conversation.organizationId !== user.organizationId) {
            throw new Error("Unauthorized: User does not have access to this conversation")
        }

        // Add the message with timestamp
        const messageWithTimestamp = {
            ...message,
            timestamp: new Date().toISOString(),
        }

        const messages = [...conversation.messages, messageWithTimestamp]

        // Update the conversation
        return await ctx.db.patch(conversationId, {
            messages,
            updatedAt: new Date().toISOString(),
        })
    },
})

// Query business assistant
export const queryBusinessAssistant = action({
    args: {
        organizationId: v.string(),
        conversationId: v.optional(v.id("assistantConversations")),
        query: v.string(),
        stream: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { organizationId, conversationId, query, stream = false } = args

        // Ensure user has access to this organization
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        // Get business data needed for assistant
        const metrics = await ctx.runQuery(internal.dashboard.getMetrics, { orgId: organizationId })
        const appointments = await ctx.runQuery(internal.analytics.getAppointmentsForAnalysis, { organizationId })
        const serviceMetrics = await ctx.runQuery(internal.analytics.getServicePerformanceMetrics, {
            organizationId,
            period: "month",
        })

        // Combine data for assistant context
        const businessData = {
            metrics,
            recentAppointments: appointments.slice(0, 50), // Limit to recent ones
            serviceMetrics,
        }

        // Get conversation history if conversationId provided
        let conversationHistory = []
        if (conversationId) {
            const conversation = await ctx.runQuery(internal.assistant.getConversationById, { conversationId })
            if (conversation) {
                conversationHistory = conversation.messages
            }
        }

        try {
            // Call the business assistant API
            const response = await fetch(
                `${process.env.VERCEL_URL || "http://localhost:3000"}/api/assistant/business-query`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query,
                        businessData,
                        conversationHistory,
                        stream,
                    }),
                },
            )

            if (!response.ok) {
                throw new Error(`Business assistant API responded with status: ${response.status}`)
            }

            if (!stream) {
                // For non-streaming responses, we get the full result
                const result = await response.json()

                // Store the assistant's response in the conversation
                if (conversationId) {
                    // Store user message
                    await ctx.runMutation(internal.assistant.addMessageToConversation, {
                        conversationId,
                        message: {
                            role: "user",
                            content: query,
                        },
                    })

                    // Store assistant message
                    await ctx.runMutation(internal.assistant.addMessageToConversation, {
                        conversationId,
                        message: {
                            role: "assistant",
                            content: result.text,
                        },
                    })
                } else {
                    // Create a new conversation with this interaction
                    const newConversationId = await ctx.runMutation(internal.assistant.storeConversation, {
                        organizationId,
                        title: query.substring(0, 50) + (query.length > 50 ? "..." : ""),
                        initialQuery: query,
                    })

                    // Store assistant message
                    await ctx.runMutation(internal.assistant.addMessageToConversation, {
                        conversationId: newConversationId,
                        message: {
                            role: "assistant",
                            content: result.text,
                        },
                    })
                }

                return result
            } else {
                // For streaming, we just pass through the response
                // The client will handle storing the messages
                const responseText = await response.text()
                return { streamResponse: responseText }
            }
        } catch (error) {
            console.error("Error querying business assistant:", error)
            throw new Error("Failed to query business assistant")
        }
    },
})

// Get conversations for a user
export const getUserConversations = query({
    args: {
        organizationId: v.string(),
        limit: v.optional(v.number()),
        includeArchived: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { organizationId, limit = 20, includeArchived = false } = args

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

        // Query for conversations
        let query = ctx.db
            .query("assistantConversations")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))

        if (!includeArchived) {
            query = query.filter((q) => q.eq(q.field("isArchived"), false))
        }

        return await query.order("desc").take(limit)
    },
})

// Get conversation by ID
export const getConversationById = query({
    args: {
        conversationId: v.id("assistantConversations"),
    },
    handler: async (ctx, args) => {
        const { conversationId } = args

        // Ensure user has access
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user) {
            throw new Error("Unauthorized: User not found")
        }

        // Get the conversation
        const conversation = await ctx.db.get(conversationId)
        if (!conversation) {
            throw new Error("Conversation not found")
        }

        // Check if user has access to the conversation's organization
        if (conversation.organizationId !== user.organizationId) {
            throw new Error("Unauthorized: User does not have access to this conversation")
        }

        return conversation
    },
})

// Archive or restore a conversation
export const toggleConversationArchived = mutation({
    args: {
        conversationId: v.id("assistantConversations"),
        isArchived: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { conversationId, isArchived } = args

        // Ensure user has access
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user) {
            throw new Error("Unauthorized: User not found")
        }

        // Get the conversation
        const conversation = await ctx.db.get(conversationId)
        if (!conversation) {
            throw new Error("Conversation not found")
        }

        // Check if user has access to the conversation's organization
        if (conversation.organizationId !== user.organizationId) {
            throw new Error("Unauthorized: User does not have access to this conversation")
        }

        // Update the conversation
        return await ctx.db.patch(conversationId, {
            isArchived,
            updatedAt: new Date().toISOString(),
        })
    },
})


