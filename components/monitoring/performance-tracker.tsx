"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { trackPageLoad } from "@/lib/monitoring/performance"

/**
 * Component that tracks page performance metrics
 * This should be included in the layout to track all page loads
 */
export function PerformanceTracker() {
    const pathname = usePathname()
    const prevPathname = useRef<string | null>(null)

    useEffect(() => {
        // Only track if the pathname has changed
        if (pathname !== prevPathname.current) {
            // Track page load performance
            trackPageLoad(pathname)

            // Update the previous pathname
            prevPathname.current = pathname
        }
    }, [pathname])

    // This component doesn't render anything
    return null
}

