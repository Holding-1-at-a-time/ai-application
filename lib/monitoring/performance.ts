import { captureMessage } from "./sentry"
import { isProductionLike } from "../config"

// Define performance thresholds
const THRESHOLDS = {
    pageLoad: 3000, // 3 seconds
    apiRequest: 1000, // 1 second
    renderTime: 500, // 500 milliseconds
}

/**
 * Track page load performance
 * @param route The route that was loaded
 */
export function trackPageLoad(route: string) {
    if (typeof window === "undefined") return

    // Use the Navigation Timing API
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
    if (!navigation) return

    const loadTime = navigation.loadEventEnd - navigation.startTime

    // Log performance data
    if (isProductionLike()) {
        // Send to analytics or monitoring service
        captureMessage(`Page load: ${route}`, loadTime > THRESHOLDS.pageLoad ? "warning" : "info", { loadTime, route })
    } else {
        console.log(`Page load (${route}): ${loadTime.toFixed(2)}ms`)
    }

    // Report to Core Web Vitals
    reportWebVitals()
}

/**
 * Track API request performance
 * @param endpoint The API endpoint
 * @param duration The request duration in milliseconds
 */
export function trackApiRequest(endpoint: string, duration: number) {
    if (isProductionLike()) {
        captureMessage(`API request: ${endpoint}`, duration > THRESHOLDS.apiRequest ? "warning" : "info", {
            duration,
            endpoint,
        })
    } else {
        console.log(`API request (${endpoint}): ${duration.toFixed(2)}ms`)
    }
}

/**
 * Track component render performance
 * @param componentName The name of the component
 * @param duration The render duration in milliseconds
 */
export function trackComponentRender(componentName: string, duration: number) {
    if (duration > THRESHOLDS.renderTime) {
        captureMessage(`Slow component render: ${componentName}`, "warning", { duration, componentName })
    }

    if (!isProductionLike()) {
        console.log(`Component render (${componentName}): ${duration.toFixed(2)}ms`)
    }
}

/**
 * Report Web Vitals metrics
 */
function reportWebVitals() {
    if (typeof window === "undefined") return

    // This would typically use a library like web-vitals
    // For simplicity, we're just using the Performance API directly

    // Example: Calculate and report CLS (Cumulative Layout Shift)
    const cls = getCLS()
    if (cls > 0.1) {
        captureMessage("High Cumulative Layout Shift", "warning", { cls })
    }

    // Example: Calculate and report LCP (Largest Contentful Paint)
    const lcp = getLCP()
    if (lcp > 2500) {
        captureMessage("Slow Largest Contentful Paint", "warning", { lcp })
    }
}

// Placeholder functions for Web Vitals calculations
// In a real implementation, you would use the web-vitals library
function getCLS(): number {
    // Simplified implementation
    return 0.05
}

function getLCP(): number {
    // Simplified implementation
    return 1500
}

