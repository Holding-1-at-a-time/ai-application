import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
    customerFeedback: defineTable({
        organizationId: v.string(),
        customerId: v.string(),
        appointmentId: v.optional(v.id("appointments")),
        date: v.string(),
        rating: v.number(),
        comment: v.string(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_customer", ["customerId"])
        .index("by_appointment", ["appointmentId"]),

    serviceImages: defineTable({
        organizationId: v.string(),
        appointmentId: v.id("appointments"),
        serviceId: v.id("services"),
        beforeImageUrl: v.string(),
        afterImageUrl: v.string(),
        uploadedAt: v.string(),
        analyzedAt: v.optional(v.string()),
        analysisResults: v.optional(
            v.object({
                qualityScore: v.number(),
                improvements: v.array(v.string()),
                detectedIssues: v.array(v.string()),
                detectedComponents: v.array(v.string()),
                summary: v.string(),
            }),
        ),
        status: v.string(), // "pending", "analyzed", "failed"
    })
        .index("by_organization", ["organizationId"])
        .index("by_appointment", ["appointmentId"])
        .index("by_service", ["serviceId"])
        .index("by_status", ["status"]),

    // New tables for alerting system
    alertSettings: defineTable({
        organizationId: v.string(),
        sentimentThreshold: v.number(), // Threshold for negative sentiment (0-10)
        patternChangeThreshold: v.number(), // Percentage threshold for unusual patterns
        enableSentimentAlerts: v.boolean(),
        enablePatternAlerts: v.boolean(),
        enableBookingAlerts: v.boolean(),
        enableRevenueAlerts: v.boolean(),
        enableQualityAlerts: v.boolean(),
        notificationChannels: v.array(v.string()), // "in-app", "email", "sms"
        notificationRecipients: v.array(
            v.object({
                userId: v.string(),
                email: v.optional(v.string()),
                phone: v.optional(v.string()),
            }),
        ),
        createdAt: v.string(),
        updatedAt: v.string(),
    }).index("by_organization", ["organizationId"]),

    alerts: defineTable({
        organizationId: v.string(),
        type: v.string(), // "sentiment", "pattern", "booking", "revenue", "quality"
        severity: v.string(), // "low", "medium", "high", "critical"
        title: v.string(),
        description: v.string(),
        data: v.object({}), // Flexible data structure for different alert types
        status: v.string(), // "new", "acknowledged", "resolved", "dismissed"
        createdAt: v.string(),
        updatedAt: v.string(),
        acknowledgedBy: v.optional(v.string()), // User ID
        acknowledgedAt: v.optional(v.string()),
        resolvedBy: v.optional(v.string()), // User ID
        resolvedAt: v.optional(v.string()),
    })
        .index("by_organization", ["organizationId"])
        .index("by_status", ["organizationId", "status"])
        .index("by_type", ["organizationId", "type"])
        .index("by_created", ["organizationId", "createdAt"]),

    notifications: defineTable({
        organizationId: v.string(),
        userId: v.string(),
        alertId: v.optional(v.id("alerts")),
        title: v.string(),
        message: v.string(),
        type: v.string(), // "alert", "info", "success"
        isRead: v.boolean(),
        channel: v.string(), // "in-app", "email", "sms"
        deliveryStatus: v.string(), // "pending", "sent", "failed"
        createdAt: v.string(),
        readAt: v.optional(v.string()),
    })
        .index("by_organization", ["organizationId"])
        .index("by_user", ["userId"])
        .index("by_user_read", ["userId", "isRead"])
        .index("by_alert", ["alertId"]),

    entityRecognition: defineTable({
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
        createdAt: v.string(),
        createdBy: v.id("users"),
    })
        .index("by_organization", ["organizationId"])
        .index("by_source", ["organizationId", "source"])
        .index("by_source_id", ["sourceId"]),

    sentimentAnalysis: defineTable({
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
        createdAt: v.string(),
        createdBy: v.id("users"),
    })
        .index("by_organization", ["organizationId"])
        .index("by_feedback_id", ["feedbackId"])
        .index("by_sentiment", ["organizationId", "sentiment.label"]),

    // Business assistant tables
    assistantConversations: defineTable({
        organizationId: v.string(),
        title: v.string(),
        createdAt: v.string(),
        updatedAt: v.string(),
        createdBy: v.id("users"),
        messages: v.array(
            v.object({
                role: v.string(),
                content: v.string(),
                timestamp: v.string(),
            }),
        ),
        isArchived: v.boolean(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_creator", ["createdBy"])
        .index("by_archived", ["organizationId", "isArchived"]),

    // Executive reports tables
    executiveReports: defineTable({
        organizationId: v.string(),
        title: v.string(),
        timeframe: v.string(),
        focusAreas: v.array(v.string()),
        audienceType: v.string(),
        report: v.any(), // full report content
        createdAt: v.string(),
        createdBy: v.id("users"),
        isArchived: v.boolean(),
    })
        .index("by_organization", ["organizationId"])
        .index("by_creator", ["createdBy"])
        .index("by_timeframe", ["organizationId", "timeframe"]),

    reportSchedules: defineTable({
        organizationId: v.string(),
        schedule: v.string(), // "daily", "weekly", "monthly", "quarterly"
        timeframe: v.string(), // "week", "month", "quarter", "year"
        focusAreas: v.array(v.string()),
        audienceType: v.string(),
        title: v.optional(v.string()),
        enabled: v.boolean(),
        createdAt: v.string(),
        updatedAt: v.string(),
        createdBy: v.id("users"),
        lastRunAt: v.optional(v.string()),
    })
        .index("by_organization", ["organizationId"])
        .index("by_organization_schedule", ["organizationId", "schedule"]),
})

