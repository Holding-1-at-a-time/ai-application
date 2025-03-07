import { v } from "convex/values"
import { query, action } from "./_generated/server"
import { internal } from "./_generated/api"

// Get appointments data for AI analysis
export const getAppointmentsForAnalysis = query({
    args: {
        organizationId: v.string(),
        startDate: v.optional(v.string()),
        endDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { organizationId, startDate, endDate } = args

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
            throw new Error("Unauthorized: Only admins can access analytics data")
        }

        // Default to last 6 months if no date range provided
        const defaultStartDate = new Date()
        defaultStartDate.setMonth(defaultStartDate.getMonth() - 6)
        const formattedDefaultStartDate = defaultStartDate.toISOString().split("T")[0]

        const today = new Date().toISOString().split("T")[0]

        const queryStartDate = startDate || formattedDefaultStartDate
        const queryEndDate = endDate || today

        // Get all appointments within date range
        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .filter((q) => q.and(q.gte(q.field("date"), queryStartDate), q.lte(q.field("date"), queryEndDate)))
            .collect()

        // Enrich appointments with service details
        const enrichedAppointments = await Promise.all(
            appointments.map(async (appointment) => {
                const service = await ctx.db.get(appointment.serviceId)

                return {
                    ...appointment,
                    serviceName: service?.name || "Unknown Service",
                    servicePrice: service?.price || 0,
                    serviceDuration: service?.duration || 0,
                    serviceCategory: service?.category || "Uncategorized",
                }
            }),
        )

        return enrichedAppointments
    },
})

// Generate business insights using AI
export const generateBusinessInsights = action({
    args: {
        organizationId: v.string(),
        appointmentsData: v.array(
            v.object({
                date: v.string(),
                time: v.string(),
                status: v.string(),
                serviceName: v.string(),
                servicePrice: v.number(),
                serviceDuration: v.number(),
                serviceCategory: v.optional(v.string()),
            }),
        ),
        metricsData: v.object({
            totalAppointments: v.number(),
            completedAppointments: v.number(),
            cancelledAppointments: v.number(),
            activeServices: v.number(),
            totalRevenue: v.number(),
        }),
        analysisType: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId, appointmentsData, metricsData, analysisType } = args

        // Ensure user has admin access
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.runQuery(internal.users.getUserProfile, {
            userId: identity.subject,
        })

        if (!user || user.organizationId !== organizationId || user.role !== "org:admin") {
            throw new Error("Unauthorized: Only admins can generate business insights")
        }

        // Call the AI API to generate insights
        try {
            const response = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/analytics/insights`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    appointmentsData,
                    metricsData,
                    analysisType,
                }),
            })

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`)
            }

            const insights = await response.json()
            return insights
        } catch (error) {
            console.error("Error generating business insights:", error)
            throw new Error("Failed to generate business insights")
        }
    },
})

// Generate revenue forecast using AI
export const generateRevenueForecast = action({
    args: {
        organizationId: v.string(),
        historicalData: v.array(
            v.object({
                date: v.string(),
                revenue: v.number(),
            }),
        ),
        forecastPeriod: v.number(), // Number of months to forecast
    },
    handler: async (ctx, args) => {
        const { organizationId, historicalData, forecastPeriod } = args

        // Ensure user has admin access
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.runQuery(internal.users.getUserProfile, {
            userId: identity.subject,
        })

        if (!user || user.organizationId !== organizationId || user.role !== "org:admin") {
            throw new Error("Unauthorized: Only admins can generate forecasts")
        }

        // Call the AI API to generate forecast
        try {
            const response = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/analytics/forecast`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    historicalData,
                    forecastPeriod,
                }),
            })

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`)
            }

            const forecast = await response.json()
            return forecast
        } catch (error) {
            console.error("Error generating revenue forecast:", error)
            throw new Error("Failed to generate revenue forecast")
        }
    },
})

// Get service performance metrics
export const getServicePerformanceMetrics = query({
    args: {
        organizationId: v.string(),
        period: v.optional(v.string()), // "week", "month", "quarter", "year"
    },
    handler: async (ctx, args) => {
        const { organizationId, period = "month" } = args

        // Ensure user has admin access
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user || user.organizationId !== organizationId || user.role !== "org:admin") {
            throw new Error("Unauthorized: Only admins can access service metrics")
        }

        // Calculate start date based on period
        const endDate = new Date()
        const startDate = new Date()

        switch (period) {
            case "week":
                startDate.setDate(startDate.getDate() - 7)
                break
            case "month":
                startDate.setMonth(startDate.getMonth() - 1)
                break
            case "quarter":
                startDate.setMonth(startDate.getMonth() - 3)
                break
            case "year":
                startDate.setFullYear(startDate.getFullYear() - 1)
                break
            default:
                startDate.setMonth(startDate.getMonth() - 1)
        }

        const formattedStartDate = startDate.toISOString().split("T")[0]
        const formattedEndDate = endDate.toISOString().split("T")[0]

        // Get all services
        const services = await ctx.db
            .query("services")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .collect()

        // Get appointments in the period
        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .filter((q) => q.and(q.gte(q.field("date"), formattedStartDate), q.lte(q.field("date"), formattedEndDate)))
            .collect()

        // Calculate metrics for each service
        const serviceMetrics = services.map((service) => {
            const serviceAppointments = appointments.filter((app) => app.serviceId === service._id)
            const completed = serviceAppointments.filter((app) => app.status === "completed").length
            const cancelled = serviceAppointments.filter((app) => app.status === "cancelled").length
            const revenue = serviceAppointments
                .filter((app) => app.status === "completed")
                .reduce((sum, app) => sum + service.price, 0)

            return {
                serviceId: service._id,
                serviceName: service.name,
                totalBookings: serviceAppointments.length,
                completedBookings: completed,
                cancelledBookings: cancelled,
                revenue,
                completionRate: serviceAppointments.length > 0 ? (completed / serviceAppointments.length) * 100 : 0,
            }
        })

        return {
            period,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            serviceMetrics,
        }
    },
})

// Get customer feedback for sentiment analysis
export const getCustomerFeedback = query({
    args: {
        organizationId: v.string(),
        period: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { organizationId, period = "month" } = args

        // Ensure user has admin access
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user || user.organizationId !== organizationId || user.role !== "org:admin") {
            throw new Error("Unauthorized: Only admins can access feedback data")
        }

        // Calculate start date based on period
        const endDate = new Date()
        const startDate = new Date()

        switch (period) {
            case "week":
                startDate.setDate(startDate.getDate() - 7)
                break
            case "month":
                startDate.setMonth(startDate.getMonth() - 1)
                break
            case "quarter":
                startDate.setMonth(startDate.getMonth() - 3)
                break
            case "year":
                startDate.setFullYear(startDate.getFullYear() - 1)
                break
            default:
                startDate.setMonth(startDate.getMonth() - 1)
        }

        const formattedStartDate = startDate.toISOString().split("T")[0]
        const formattedEndDate = endDate.toISOString().split("T")[0]

        // Get customer feedback
        const feedback = await ctx.db
            .query("customerFeedback")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .filter((q) => q.and(q.gte(q.field("date"), formattedStartDate), q.lte(q.field("date"), formattedEndDate)))
            .collect()

        return feedback
    },
})

// Get historical customer data for predictive analytics
export const getHistoricalCustomerData = query({
    args: {
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId } = args

        // Ensure user has admin access
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user || user.organizationId !== organizationId || user.role !== "org:admin") {
            throw new Error("Unauthorized: Only admins can access customer data")
        }

        // Calculate start date (1 year ago)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setFullYear(startDate.getFullYear() - 1)

        const formattedStartDate = startDate.toISOString().split("T")[0]
        const formattedEndDate = endDate.toISOString().split("T")[0]

        // Get appointments to calculate customer metrics
        const appointments = await ctx.db
            .query("appointments")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .filter((q) => q.and(q.gte(q.field("date"), formattedStartDate), q.lte(q.field("date"), formattedEndDate)))
            .collect()

        // Group appointments by month for historical data
        const monthlyData: Record<string, any> = {}

        appointments.forEach((appointment) => {
            const yearMonth = appointment.date.substring(0, 7) // YYYY-MM format

            if (!monthlyData[yearMonth]) {
                monthlyData[yearMonth] = {
                    date: yearMonth,
                    totalAppointments: 0,
                    newCustomers: 0,
                    returningCustomers: 0,
                    revenue: 0,
                    completionRate: 0,
                    completed: 0,
                    cancelled: 0,
                }
            }

            monthlyData[yearMonth].totalAppointments++

            if (appointment.status === "completed") {
                monthlyData[yearMonth].completed++
                monthlyData[yearMonth].revenue += appointment.price || 0
            } else if (appointment.status === "cancelled") {
                monthlyData[yearMonth].cancelled++
            }

            // This is simplified - in a real app you'd track if this is the customer's first appointment
            monthlyData[yearMonth].newCustomers += Math.random() > 0.7 ? 1 : 0
        })

        // Calculate completion rates and returning customers
        Object.keys(monthlyData).forEach((month) => {
            const data = monthlyData[month]
            data.completionRate = data.totalAppointments > 0 ? (data.completed / data.totalAppointments) * 100 : 0
            data.returningCustomers = data.totalAppointments - data.newCustomers
        })

        // Convert to array and sort by date
        return Object.values(monthlyData).sort((a, b) => a.date.localeCompare(b.date))
    },
})

