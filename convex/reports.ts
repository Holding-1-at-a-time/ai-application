import { v } from "convex/values"
import { query, mutation, action } from "./_generated/server"
import { internal } from "./_generated/api"

// Generate executive report
export const generateExecutiveReport = action({
    args: {
        organizationId: v.string(),
        timeframe: v.string(),
        focusAreas: v.optional(v.array(v.string())),
        audienceType: v.optional(v.string()),
        title: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { organizationId, timeframe, focusAreas = [], audienceType = "executive", title } = args

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
            throw new Error("Unauthorized: Only admins can generate executive reports")
        }

        try {
            // Get business data needed for report
            const metrics = await ctx.runQuery(internal.dashboard.getMetrics, { orgId: organizationId })
            const appointments = await ctx.runQuery(internal.analytics.getAppointmentsForAnalysis, { organizationId })
            const serviceMetrics = await ctx.runQuery(internal.analytics.getServicePerformanceMetrics, {
                organizationId,
                period: timeframe === "year" ? "year" : timeframe === "quarter" ? "quarter" : "month",
            })

            // Get historical customer data
            const historicalData = await ctx.runQuery(internal.analytics.getHistoricalCustomerData, { organizationId })

            // Combine data for report generation
            const businessData = {
                metrics,
                appointments,
                serviceMetrics,
                historicalData,
            }

            // Call the report generation API
            const response = await fetch(
                `${process.env.VERCEL_URL || "http://localhost:3000"}/api/reports/executive-summary`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        businessData,
                        timeframe,
                        focusAreas,
                        audienceType,
                    }),
                },
            )

            if (!response.ok) {
                throw new Error(`Report generation API responded with status: ${response.status}`)
            }

            const report = await response.json()

            // Store the report in the database
            const reportId = await ctx.runMutation(internal.reports.storeExecutiveReport, {
                organizationId,
                title: title || report.title,
                timeframe,
                focusAreas,
                audienceType,
                report,
            })

            return {
                report,
                reportId,
            }
        } catch (error) {
            console.error("Error generating executive report:", error)
            throw new Error("Failed to generate executive report")
        }
    },
})

// Store executive report
export const storeExecutiveReport = mutation({
    args: {
        organizationId: v.string(),
        title: v.string(),
        timeframe: v.string(),
        focusAreas: v.array(v.string()),
        audienceType: v.string(),
        report: v.any(),
    },
    handler: async (ctx, args) => {
        const { organizationId, title, timeframe, focusAreas, audienceType, report } = args

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
            throw new Error("Unauthorized: Only admins can store executive reports")
        }

        return await ctx.db.insert("executiveReports", {
            organizationId,
            title,
            timeframe,
            focusAreas,
            audienceType,
            report,
            createdAt: new Date().toISOString(),
            createdBy: user._id,
            isArchived: false,
        })
    },
})

// Get reports for an organization
export const getOrganizationReports = query({
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

        // Query for reports
        let query = ctx.db
            .query("executiveReports")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))

        if (!includeArchived) {
            query = query.filter((q) => q.eq(q.field("isArchived"), false))
        }

        return await query.order("desc").take(limit)
    },
})

// Get report by ID
export const getReportById = query({
    args: {
        reportId: v.id("executiveReports"),
    },
    handler: async (ctx, args) => {
        const { reportId } = args

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

        // Get the report
        const report = await ctx.db.get(reportId)
        if (!report) {
            throw new Error("Report not found")
        }

        // Check if user has access to the report's organization
        if (report.organizationId !== user.organizationId) {
            throw new Error("Unauthorized: User does not have access to this report")
        }

        return report
    },
})

// Archive or restore a report
export const toggleReportArchived = mutation({
    args: {
        reportId: v.id("executiveReports"),
        isArchived: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { reportId, isArchived } = args

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

        // Get the report
        const report = await ctx.db.get(reportId)
        if (!report) {
            throw new Error("Report not found")
        }

        // Check if user has access to the report's organization
        if (report.organizationId !== user.organizationId) {
            throw new Error("Unauthorized: User does not have access to this report")
        }

        // Update the report
        return await ctx.db.patch(reportId, {
            isArchived,
        })
    },
})

// Schedule automatic report generation
export const scheduleAutomaticReport = mutation({
    args: {
        organizationId: v.string(),
        schedule: v.string(), // "daily", "weekly", "monthly", "quarterly"
        timeframe: v.string(), // "week", "month", "quarter", "year"
        focusAreas: v.optional(v.array(v.string())),
        audienceType: v.optional(v.string()),
        title: v.optional(v.string()),
        enabled: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { organizationId, schedule, timeframe, focusAreas = [], audienceType = "executive", title, enabled } = args

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
            throw new Error("Unauthorized: Only admins can schedule reports")
        }

        // Check if a schedule already exists
        const existingSchedule = await ctx.db
            .query("reportSchedules")
            .withIndex("by_organization_schedule", (q) => q.eq("organizationId", organizationId).eq("schedule", schedule))
            .first()

        if (existingSchedule) {
            // Update existing schedule
            return await ctx.db.patch(existingSchedule._id, {
                timeframe,
                focusAreas,
                audienceType,
                title,
                enabled,
                updatedAt: new Date().toISOString(),
            })
        } else {
            // Create new schedule
            return await ctx.db.insert("reportSchedules", {
                organizationId,
                schedule,
                timeframe,
                focusAreas,
                audienceType,
                title,
                enabled,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: user._id,
            })
        }
    },
})

// Get report schedules for an organization
export const getReportSchedules = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args

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
            throw new Error("Unauthorized: Only admins can view report schedules")
        }

        return await ctx.db
            .query("reportSchedules")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .collect()
    },
})

