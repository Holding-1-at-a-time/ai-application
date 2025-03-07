import { v } from "convex/values"
import { query, mutation, action } from "./_generated/server"
import { internal } from "./_generated/api"

// Get alert settings for an organization
export const getAlertSettings = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args

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

        // Get alert settings
        const settings = await ctx.db
            .query("alertSettings")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .first()

        // Return default settings if none exist
        if (!settings) {
            return {
                organizationId,
                sentimentThreshold: 3, // Alert on sentiment below 3/10
                patternChangeThreshold: 25, // Alert on 25% change
                enableSentimentAlerts: true,
                enablePatternAlerts: true,
                enableBookingAlerts: true,
                enableRevenueAlerts: true,
                enableQualityAlerts: true,
                notificationChannels: ["in-app"],
                notificationRecipients: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        }

        return settings
    },
})

// Save alert settings
export const saveAlertSettings = mutation({
    args: {
        organizationId: v.string(),
        sentimentThreshold: v.number(),
        patternChangeThreshold: v.number(),
        enableSentimentAlerts: v.boolean(),
        enablePatternAlerts: v.boolean(),
        enableBookingAlerts: v.boolean(),
        enableRevenueAlerts: v.boolean(),
        enableQualityAlerts: v.boolean(),
        notificationChannels: v.array(v.string()),
        notificationRecipients: v.array(
            v.object({
                userId: v.string(),
                email: v.optional(v.string()),
                phone: v.optional(v.string()),
            }),
        ),
    },
    handler: async (ctx, args) => {
        const {
            organizationId,
            sentimentThreshold,
            patternChangeThreshold,
            enableSentimentAlerts,
            enablePatternAlerts,
            enableBookingAlerts,
            enableRevenueAlerts,
            enableQualityAlerts,
            notificationChannels,
            notificationRecipients,
        } = args

        // Ensure user has admin access to this organization
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user || user.organizationId !== organizationId || user.role !== "org:admin") {
            throw new Error("Unauthorized: Only admins can modify alert settings")
        }

        // Check if settings already exist
        const existingSettings = await ctx.db
            .query("alertSettings")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .first()

        const now = new Date().toISOString()

        if (existingSettings) {
            // Update existing settings
            return await ctx.db.patch(existingSettings._id, {
                sentimentThreshold,
                patternChangeThreshold,
                enableSentimentAlerts,
                enablePatternAlerts,
                enableBookingAlerts,
                enableRevenueAlerts,
                enableQualityAlerts,
                notificationChannels,
                notificationRecipients,
                updatedAt: now,
            })
        } else {
            // Create new settings
            return await ctx.db.insert("alertSettings", {
                organizationId,
                sentimentThreshold,
                patternChangeThreshold,
                enableSentimentAlerts,
                enablePatternAlerts,
                enableBookingAlerts,
                enableRevenueAlerts,
                enableQualityAlerts,
                notificationChannels,
                notificationRecipients,
                createdAt: now,
                updatedAt: now,
            })
        }
    },
})

// Get alerts for an organization
export const getAlerts = query({
    args: {
        organizationId: v.string(),
        status: v.optional(v.string()),
        type: v.optional(v.string()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { organizationId, status, type, limit = 50 } = args

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

        // Build query based on filters
        let query = ctx.db.query("alerts")

        if (status) {
            query = query.withIndex("by_status", (q) => q.eq("organizationId", organizationId).eq("status", status))
        } else if (type) {
            query = query.withIndex("by_type", (q) => q.eq("organizationId", organizationId).eq("type", type))
        } else {
            query = query.withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
        }

        // Get alerts with limit
        return await query.order("desc").take(limit)
    },
})

// Create a new alert
export const createAlert = mutation({
    args: {
        organizationId: v.string(),
        type: v.string(),
        severity: v.string(),
        title: v.string(),
        description: v.string(),
        data: v.object({}),
    },
    handler: async (ctx, args) => {
        const { organizationId, type, severity, title, description, data } = args

        // Get alert settings to check if this type of alert is enabled
        const settings = await ctx.db
            .query("alertSettings")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .first()

        // Check if this type of alert is enabled
        if (settings) {
            const alertTypeEnabled =
                (type === "sentiment" && !settings.enableSentimentAlerts) ||
                (type === "pattern" && !settings.enablePatternAlerts) ||
                (type === "booking" && !settings.enableBookingAlerts) ||
                (type === "revenue" && !settings.enableRevenueAlerts) ||
                (type === "quality" && !settings.enableQualityAlerts)

            if (!alertTypeEnabled) {
                // Skip creating the alert if this type is disabled
                return null
            }
        }

        const now = new Date().toISOString()

        // Create the alert
        const alertId = await ctx.db.insert("alerts", {
            organizationId,
            type,
            severity,
            title,
            description,
            data,
            status: "new",
            createdAt: now,
            updatedAt: now,
        })

        // Send notifications for this alert
        if (settings) {
            // Get notification recipients
            const recipients = settings.notificationRecipients
            const channels = settings.notificationChannels

            // Create notifications for each recipient and channel
            for (const recipient of recipients) {
                for (const channel of channels) {
                    await ctx.db.insert("notifications", {
                        organizationId,
                        userId: recipient.userId,
                        alertId,
                        title,
                        message: description,
                        type: "alert",
                        isRead: false,
                        channel,
                        deliveryStatus: "pending",
                        createdAt: now,
                    })
                }
            }

            // Schedule notification delivery
            await ctx.scheduler.runAfter(0, internal.alerts.deliverNotifications, {
                alertId,
                organizationId,
            })
        }

        return alertId
    },
})

// Update alert status
export const updateAlertStatus = mutation({
    args: {
        alertId: v.id("alerts"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        const { alertId, status } = args

        // Ensure user has access to this alert
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

        // Get the alert
        const alert = await ctx.db.get(alertId)
        if (!alert) {
            throw new Error("Alert not found")
        }

        // Check if user has access to the organization
        if (alert.organizationId !== user.organizationId) {
            throw new Error("Unauthorized: User does not have access to this alert")
        }

        const now = new Date().toISOString()
        const updateData: any = {
            status,
            updatedAt: now,
        }

        // Add additional data based on status
        if (status === "acknowledged") {
            updateData.acknowledgedBy = user._id
            updateData.acknowledgedAt = now
        } else if (status === "resolved") {
            updateData.resolvedBy = user._id
            updateData.resolvedAt = now
        }

        // Update the alert
        return await ctx.db.patch(alertId, updateData)
    },
})

// Get notifications for a user
export const getUserNotifications = query({
    args: {
        unreadOnly: v.optional(v.boolean()),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { unreadOnly = false, limit = 50 } = args

        // Get current user
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user) {
            throw new Error("User not found")
        }

        // Get notifications for this user
        let query = ctx.db.query("notifications")

        if (unreadOnly) {
            query = query.withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("isRead", false))
        } else {
            query = query.withIndex("by_user", (q) => q.eq("userId", user._id))
        }

        // Get notifications with limit
        return await query.order("desc").take(limit)
    },
})

// Mark notification as read
export const markNotificationRead = mutation({
    args: {
        notificationId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        const { notificationId } = args

        // Get current user
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user) {
            throw new Error("User not found")
        }

        // Get the notification
        const notification = await ctx.db.get(notificationId)
        if (!notification) {
            throw new Error("Notification not found")
        }

        // Check if notification belongs to this user
        if (notification.userId !== user._id) {
            throw new Error("Unauthorized: This notification does not belong to you")
        }

        // Mark as read
        return await ctx.db.patch(notificationId, {
            isRead: true,
            readAt: new Date().toISOString(),
        })
    },
})

// Mark all notifications as read
export const markAllNotificationsRead = mutation({
    args: {},
    handler: async (ctx) => {
        // Get current user
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user) {
            throw new Error("User not found")
        }

        // Get all unread notifications for this user
        const unreadNotifications = await ctx.db
            .query("notifications")
            .withIndex("by_user_read", (q) => q.eq("userId", user._id).eq("isRead", false))
            .collect()

        const now = new Date().toISOString()

        // Mark each notification as read
        for (const notification of unreadNotifications) {
            await ctx.db.patch(notification._id, {
                isRead: true,
                readAt: now,
            })
        }

        return { markedRead: unreadNotifications.length }
    },
})

// Deliver notifications (internal)
export const deliverNotifications = action({
    args: {
        alertId: v.id("alerts"),
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { alertId, organizationId } = args

        // Get the alert
        const alert = await ctx.runQuery(internal.alerts.getAlertById, {
            alertId,
        })

        if (!alert) {
            throw new Error("Alert not found")
        }

        // Get pending notifications for this alert
        const notifications = await ctx.runQuery(internal.alerts.getPendingNotifications, {
            alertId,
        })

        // Get alert settings for notification channels
        const settings = await ctx.runQuery(internal.alerts.getAlertSettingsById, {
            organizationId,
        })

        if (!settings) {
            throw new Error("Alert settings not found")
        }

        // Process each notification
        for (const notification of notifications) {
            try {
                if (notification.channel === "in-app") {
                    // In-app notifications are already created, just mark as sent
                    await ctx.runMutation(internal.alerts.updateNotificationStatus, {
                        notificationId: notification._id,
                        status: "sent",
                    })
                } else if (notification.channel === "email" && settings.notificationChannels.includes("email")) {
                    // Send email notification
                    // In a real implementation, you would integrate with an email service
                    console.log(`Sending email notification: ${notification.title} to user ${notification.userId}`)

                    // Mark as sent
                    await ctx.runMutation(internal.alerts.updateNotificationStatus, {
                        notificationId: notification._id,
                        status: "sent",
                    })
                } else if (notification.channel === "sms" && settings.notificationChannels.includes("sms")) {
                    // Send SMS notification using Twilio
                    const recipient = settings.notificationRecipients.find((r) => r.userId === notification.userId)

                    if (recipient && recipient.phone) {
                        // In a real implementation, you would call the Twilio API
                        // For this example, we'll use a serverless function
                        const response = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/send-sms`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                to: recipient.phone,
                                message: `${notification.title}: ${notification.message}`,
                            }),
                        })

                        if (response.ok) {
                            // Mark as sent
                            await ctx.runMutation(internal.alerts.updateNotificationStatus, {
                                notificationId: notification._id,
                                status: "sent",
                            })
                        } else {
                            // Mark as failed
                            await ctx.runMutation(internal.alerts.updateNotificationStatus, {
                                notificationId: notification._id,
                                status: "failed",
                            })
                        }
                    } else {
                        // No phone number, mark as failed
                        await ctx.runMutation(internal.alerts.updateNotificationStatus, {
                            notificationId: notification._id,
                            status: "failed",
                        })
                    }
                }
            } catch (error) {
                console.error("Error delivering notification:", error)

                // Mark as failed
                await ctx.runMutation(internal.alerts.updateNotificationStatus, {
                    notificationId: notification._id,
                    status: "failed",
                })
            }
        }

        return { delivered: notifications.length }
    },
})

// Get alert by ID (internal)
export const getAlertById = query({
    args: {
        alertId: v.id("alerts"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.alertId)
    },
})

// Get pending notifications for an alert (internal)
export const getPendingNotifications = query({
    args: {
        alertId: v.id("notifications"),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("notifications")
            .withIndex("by_alert", (q) => q.eq("alertId", args.alertId))
            .filter((q) => q.eq(q.field("deliveryStatus"), "pending"))
            .collect()
    },
})

// Get alert settings by organization ID (internal)
export const getAlertSettingsById = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("alertSettings")
            .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
            .first()
    },
})

// Update notification status (internal)
export const updateNotificationStatus = mutation({
    args: {
        notificationId: v.id("notifications"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.patch(args.notificationId, {
            deliveryStatus: args.status,
        })
    },
})

