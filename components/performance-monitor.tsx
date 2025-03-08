"use client"

import { useEffect, type ReactNode } from "react"
import { markStart, markEnd, reportPerformanceMetrics } from "@/lib/performance"

interface PerformanceMonitorProps {
    children: ReactNode
    id: string
    reportOnUnmount?: boolean
}

export function PerformanceMonitor({ children, id, reportOnUnmount = false }: PerformanceMonitorProps) {
    useEffect(() => {
        // Mark component mount
        markStart(`component-${id}`)

        // Report metrics on page load
        const onLoad = () => {
            markEnd(`component-${id}`)
            if (reportOnUnmount) {
                reportPerformanceMetrics()
            }
        }

        window.addEventListener("load", onLoad)

        return () => {
            window.removeEventListener("load", onLoad)

            // Mark component unmount
            markEnd(`component-${id}`)

            if (reportOnUnmount) {
                reportPerformanceMetrics()
            }
        }
    }, [id, reportOnUnmount])

    return <>{children}</>
}

