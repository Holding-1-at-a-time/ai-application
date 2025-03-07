import { v } from "convex/values"
import { query, mutation, action } from "./_generated/server"
import { internal } from "./_generated/api"

// Get service images for a specific appointment
export const getServiceImages = query({
    args: {
        organizationId: v.string(),
        appointmentId: v.optional(v.id("appointments")),
        serviceId: v.optional(v.id("services")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { organizationId, appointmentId, serviceId, limit = 50 } = args

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

        // Build query based on provided filters
        let query = ctx.db
            .query("serviceImages")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))

        if (appointmentId) {
            query = ctx.db.query("serviceImages").withIndex("by_appointment", (q) => q.eq("appointmentId", appointmentId))
        } else if (serviceId) {
            query = ctx.db.query("serviceImages").withIndex("by_service", (q) => q.eq("serviceId", serviceId))
        }

        // Get images with limit
        const images = await query.order("desc").take(limit)

        // Enrich with appointment and service details
        const enrichedImages = await Promise.all(
            images.map(async (image) => {
                const appointment = await ctx.db.get(image.appointmentId)
                const service = await ctx.db.get(image.serviceId)

                return {
                    ...image,
                    appointmentDetails: appointment
                        ? {
                            date: appointment.date,
                            time: appointment.time,
                            status: appointment.status,
                        }
                        : null,
                    serviceDetails: service
                        ? {
                            name: service.name,
                            category: service.category,
                        }
                        : null,
                }
            }),
        )

        return enrichedImages
    },
})

// Store a new service image pair
export const storeServiceImages = mutation({
    args: {
        organizationId: v.string(),
        appointmentId: v.id("appointments"),
        serviceId: v.id("services"),
        beforeImageUrl: v.string(),
        afterImageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const { organizationId, appointmentId, serviceId, beforeImageUrl, afterImageUrl } = args

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

        // Verify appointment and service exist and belong to the organization
        const appointment = await ctx.db.get(appointmentId)
        if (!appointment || appointment.organizationId !== organizationId) {
            throw new Error("Invalid appointment")
        }

        const service = await ctx.db.get(serviceId)
        if (!service || service.organizationId !== organizationId) {
            throw new Error("Invalid service")
        }

        // Store the image pair
        const imageId = await ctx.db.insert("serviceImages", {
            organizationId,
            appointmentId,
            serviceId,
            beforeImageUrl,
            afterImageUrl,
            uploadedAt: new Date().toISOString(),
            status: "pending",
        })

        // Schedule analysis
        await ctx.scheduler.runAfter(0, internal.serviceImages.analyzeServiceImages, {
            imageId,
            organizationId,
        })

        return imageId
    },
})

// Analyze service images using AI
export const analyzeServiceImages = action({
    args: {
        imageId: v.id("serviceImages"),
        organizationId: v.string(),
    },
    handler: async (ctx, args) => {
        const { imageId, organizationId } = args

        // Get the image record
        const imageRecord = await ctx.runQuery(internal.serviceImages.getImageById, {
            imageId,
        })

        if (!imageRecord) {
            throw new Error("Image record not found")
        }

        try {
            // Call the AI API to analyze the images
            const response = await fetch(`${process.env.VERCEL_URL || "http://localhost:3000"}/api/image-analysis`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    beforeImageUrl: imageRecord.beforeImageUrl,
                    afterImageUrl: imageRecord.afterImageUrl,
                    serviceId: imageRecord.serviceId,
                }),
            })

            if (!response.ok) {
                throw new Error(`API responded with status: ${response.status}`)
            }

            const analysisResults = await response.json()

            // Update the image record with analysis results
            await ctx.runMutation(internal.serviceImages.updateImageAnalysis, {
                imageId,
                analysisResults,
                status: "analyzed",
            })

            return analysisResults
        } catch (error) {
            console.error("Error analyzing service images:", error)

            // Update the image record with failure status
            await ctx.runMutation(internal.serviceImages.updateImageAnalysis, {
                imageId,
                status: "failed",
                error: error instanceof Error ? error.message : "Unknown error",
            })

            throw new Error("Failed to analyze service images")
        }
    },
})

// Get image by ID (internal)
export const getImageById = query({
    args: {
        imageId: v.id("serviceImages"),
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.imageId)
    },
})

// Update image analysis results (internal)
export const updateImageAnalysis = mutation({
    args: {
        imageId: v.id("serviceImages"),
        analysisResults: v.optional(
            v.object({
                qualityScore: v.number(),
                improvements: v.array(v.string()),
                detectedIssues: v.array(v.string()),
                detectedComponents: v.array(v.string()),
                summary: v.string(),
            }),
        ),
        status: v.string(),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { imageId, analysisResults, status, error } = args

        const updateData: any = {
            status,
            analyzedAt: new Date().toISOString(),
        }

        if (analysisResults) {
            updateData.analysisResults = analysisResults
        }

        if (error) {
            updateData.error = error
        }

        return await ctx.db.patch(imageId, updateData)
    },
})

// Get analysis statistics
export const getAnalysisStatistics = query({
    args: {
        organizationId: v.string(),
        period: v.optional(v.string()), // "week", "month", "quarter", "year"
    },
    handler: async (ctx, args) => {
        const { organizationId, period = "month" } = args

        // Ensure user has access to this organization
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new Error("Unauthorized")
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first()

        if (!user || user.organizationId !== organizationId || user.role !== "org:admin") {
            throw new Error("Unauthorized: Only admins can access analysis statistics")
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

        const formattedStartDate = startDate.toISOString()
        const formattedEndDate = endDate.toISOString()

        // Get analyzed images in the period
        const analyzedImages = await ctx.db
            .query("serviceImages")
            .withIndex("by_organization", (q) => q.eq("organizationId", organizationId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("status"), "analyzed"),
                    q.gte(q.field("analyzedAt"), formattedStartDate),
                    q.lte(q.field("analyzedAt"), formattedEndDate),
                ),
            )
            .collect()

        // Calculate statistics
        const totalAnalyzed = analyzedImages.length

        // Calculate average quality score
        const averageQualityScore =
            totalAnalyzed > 0
                ? analyzedImages.reduce((sum, img) => sum + (img.analysisResults?.qualityScore || 0), 0) / totalAnalyzed
                : 0

        // Get most common issues
        const allIssues = analyzedImages.flatMap((img) => img.analysisResults?.detectedIssues || [])
        const issueCount: Record<string, number> = {}

        allIssues.forEach((issue) => {
            issueCount[issue] = (issueCount[issue] || 0) + 1
        })

        const commonIssues = Object.entries(issueCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([issue, count]) => ({ issue, count }))

        // Get most common improvements
        const allImprovements = analyzedImages.flatMap((img) => img.analysisResults?.improvements || [])
        const improvementCount: Record<string, number> = {}

        allImprovements.forEach((improvement) => {
            improvementCount[improvement] = (improvementCount[improvement] || 0) + 1
        })

        const commonImprovements = Object.entries(improvementCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([improvement, count]) => ({ improvement, count }))

        // Get service quality distribution
        const qualityDistribution = {
            excellent: analyzedImages.filter((img) => (img.analysisResults?.qualityScore || 0) >= 8).length,
            good: analyzedImages.filter((img) => {
                const score = img.analysisResults?.qualityScore || 0
                return score >= 6 && score < 8
            }).length,
            average: analyzedImages.filter((img) => {
                const score = img.analysisResults?.qualityScore || 0
                return score >= 4 && score < 6
            }).length,
            poor: analyzedImages.filter((img) => (img.analysisResults?.qualityScore || 0) < 4).length,
        }

        return {
            period,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            totalAnalyzed,
            averageQualityScore,
            commonIssues,
            commonImprovements,
            qualityDistribution,
        }
    },
})

