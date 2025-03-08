import * as Sentry from "@sentry/nextjs"
import { config, isProductionLike } from "../config"

/**
 * Initialize Sentry for error tracking
 * This should be called during application initialization
 */
export function initSentry() {
    // Only initialize Sentry in production-like environments
    if (isProductionLike()) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: config.environment,
            tracesSampleRate: config.environment === "production" ? 0.1 : 0.5,

            // Adjust this value based on your application's needs
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,

            // Add any custom tags
            initialScope: {
                tags: {
                    appName: config.appName,
                    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
                },
            },
        })
    }
}

/**
 * Capture an exception with Sentry
 * @param error The error to capture
 * @param context Additional context information
 */
export function captureException(error: Error, context?: Record<string, any>) {
    if (isProductionLike()) {
        Sentry.captureException(error, {
            extra: context,
        })
    } else {
        // In development, log to console
        console.error("Error captured:", error, context)
    }
}

/**
 * Capture a message with Sentry
 * @param message The message to capture
 * @param level The severity level
 * @param context Additional context information
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info", context?: Record<string, any>) {
    if (isProductionLike()) {
        Sentry.captureMessage(message, {
            level,
            extra: context,
        })
    } else {
        // In development, log to console
        console.log(`[${level}] ${message}`, context)
    }
}

/**
 * Set user information for Sentry
 * Call this after user authentication
 * @param user User information
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
    if (isProductionLike()) {
        Sentry.setUser(user)
    }
}

/**
 * Clear user information from Sentry
 * Call this after user logout
 */
export function clearUser() {
    if (isProductionLike()) {
        Sentry.setUser(null)
    }
}

