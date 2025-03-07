import { v } from "convex/values"
import { query, action } from "./_generated/server"
import { internal } from "./_generated/api"

// Analyze customer feedback for negative sentiment
export const analyzeSentiment = action({
    args: {
        organizationId: v.string(),
        feedbackId: v.optional(v.id("customerFeedback")),
    },
    handler: async (ctx, args) => {
        const { organizationId, feedbackId } = args

        // Get alert settings
        const settings = await ctx.runQuery(internal.alerts.getAlertSettingsById, {
            organizationId,
        })

        if (!settings || !settings.enableSentimentAlerts) {
            // Skip if sentiment alerts are disabled
            return null
        }

        let feedback

        if (feedbackId) {
            // Get specific feedback
            feedback = await ctx.runQuery(internal.alertDetection.getFeedbackById, {
                feedbackId,
            })

            if (!feedback) {
                throw new Error("Feedback not found")
            }

            // Process single feedback
            return await processFeedback(ctx, feedback, settings)
        } else {
            // Get recent feedback (last 24 hours)
            const yesterday = new Date()
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayStr = yesterday.toISOString().split("T")[0]

            const recentFeedback = await ctx.runQuery(internal.alertDetection.getRecentFeedback, {
                organizationId,
                since: yesterdayStr,
            })

            // Process each feedback
            const results = []
            for (const item of recentFeedback) {
                const result = await processFeedback(ctx, item, settings)
                if (result) {
                    results.push(result)
                }
            }

            return results
        }
    },
})

// Detect unusual business patterns
export const detectPatternChanges = action({
    args: {
        organizationId: v.string(),
        metricType: v.string(), // "bookings", "revenue", "cancellations"
    },
    handler: async (ctx, args) => {
        const { organizationId, metricType } = args

        // Get alert settings
        const settings = await ctx.runQuery(internal.alerts.getAlertSettingsById, {
            organizationId,
        })

        if (!settings) {
            // Skip if no settings
            return null
        }

        // Check if this type of alert is enabled
        const isEnabled =
            (metricType === "bookings" && settings.enableBookingAlerts) ||
            (metricType === "revenue" && settings.enableRevenueAlerts)

        if (!isEnabled) {
            // Skip if this type of alert is disabled
            return null
        }

        // Get historical data for comparison
        const historicalData = await ctx.runQuery(internal.analytics.getHistoricalCustomerData, {
            organizationId,
        })

        if (!historicalData || historicalData.length < 2) {
            // Not enough data for comparison
            return null
        }

        // Get current period and previous period data
        const currentPeriod = historicalData[historicalData.length - 1]
        const previousPeriod = historicalData[historicalData.length - 2]

        // Calculate change percentage based on metric type
        let currentValue = 0
        let previousValue = 0
        let metricName = ""

        switch (metricType) {
            case "bookings":
                currentValue = currentPeriod.totalAppointments
                previousValue = previousPeriod.totalAppointments
                metricName = "booking volume"
                break
            case "revenue":
                currentValue = currentPeriod.revenue
                previousValue = previousPeriod.revenue
                metricName = "revenue"
                break
            case "cancellations":
                currentValue = currentPeriod.cancelled
                previousValue = previousPeriod.cancelled
                metricName = "cancellation rate"
                break
            default:
                throw new Error(`Unknown metric type: ${metricType}`)
        }

        // Calculate percentage change
        const percentChange = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0

        // Check if change exceeds threshold
        if (Math.abs(percentChange) >= settings.patternChangeThreshold) {
            // Determine if it's an increase or decrease
            const direction = percentChange > 0 ? "increase" : "decrease"

            // Determine severity
            let severity = "medium"
            if (Math.abs(percentChange) >= settings.patternChangeThreshold * 2) {
                severity = "high"
            }
            if (metricType === "cancellations" && percentChange > 0) {
                // Increasing cancellations is always high severity
                severity = "high"
            }
            if (metricType === "revenue" && percentChange < 0) {
                // Decreasing revenue is high severity
                severity = "high"
            }

            // Create alert
            const alertId = await ctx.runMutation(internal.alerts.createAlert, {
                organizationId,
                type: "pattern",
                severity,
                title: `Unusual ${metricName} ${direction} detected`,
                description: `${metricName.charAt(0).toUpperCase() + metricName.slice(1)} has ${direction}d by ${Math.abs(percentChange).toFixed(1)}% compared to the previous period.`,
                data: {
                    metricType,
                    currentValue,
                    previousValue,
                    percentChange,
                    currentPeriod: currentPeriod.date,
                    previousPeriod: previousPeriod.date,
                },
            })

            return alertId
        }

        return null
    },
})

// Get feedback by ID (internal)
export const getFeedbackById = query({
    args: {
        feedbackId: v.id("customerFeedback"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.feedbackId)
    },
})

// Get recent feedback (internal)
export const getRecentFeedback = query({
    args: {
        organizationId: v.string(),
        since: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("customerFeedback")
            .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
            .filter((q) => q.gte(q.field("date"), args.since))
            .collect()
    },
})

// Process a single feedback item
async function processFeedback(ctx: any, feedback: any, settings: any) {
    // Skip if rating is above threshold (not negative)
    if (feedback.rating > settings.sentimentThreshold) {
        return null
    }

    // Check if we already have an alert for this feedback
    const existingAlerts = await ctx.runQuery(internal.alertDetection.getAlertsByFeedback, {
        organizationId: feedback.organizationId,
        feedbackId: feedback._id,
    })

    if (existingAlerts.length > 0) {
        // Already alerted for this feedback
        return null
    }

    // Determine severity based on rating
    let severity = "medium"
    if (feedback.rating <= settings.sentimentThreshold / 2) {
        severity = "high"
    }
    if (feedback.rating === 0) {
        severity = "critical"
    }

    // Create alert
    const alertId = await ctx.runMutation(internal.alerts.createAlert, {
        organizationId: feedback.organizationId,
        type: "sentiment",
        severity,
        title: `Negative customer feedback detected`,
        description: `Customer gave a rating of ${feedback.rating}/10 with comment: "${feedback.comment}"`,
        data: {
            feedbackId: feedback._id,
            customerId: feedback.customerId,
            appointmentId: feedback.appointmentId,
            rating: feedback.rating,
            comment: feedback.comment,
            date: feedback.date,
        },
    })

    return alertId
}

// Get alerts by feedback (internal)
export const getAlertsByFeedback = query({
    args: {
        organizationId: v.string(),
        feedbackId: v.id("customerFeedback"),
    },
    handler: async (ctx, args) => {
        const { organizationId, feedbackId } = args

        // Find alerts that reference this feedback
        return await ctx.db
            .query("alerts")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .filter((q) => q.and(q.eq(q.field("type"), "sentiment"), q.eq(q.field("data.feedbackId"), feedbackId)))
            .collect()
    },
})

// Schedule regular pattern detection
export const schedulePatternDetection = action({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args

        // Run detection for each metric type
        const bookingResult = await ctx.runAction(internal.alertDetection.detectPatternChanges, {
            organizationId,
            metricType: "bookings",
        })

        const revenueResult = await ctx.runAction(internal.alertDetection.detectPatternChanges, {
            organizationId,
            metricType: "revenue",
        })

        const cancellationResult = await ctx.runAction(internal.alertDetection.detectPatternChanges, {
            organizationId,
            metricType: "cancellations",
        })

        return {
            bookingAlert: bookingResult,
            revenueAlert: revenueResult,
            cancellationAlert: cancellationResult,
        }
    },
})

