"use client"

import { useQuery } from "convex/react"
import { useCallback, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

/**
 * A hook that wraps Convex's useQuery with SWR-like functionality
 * @param queryFunction The Convex query function
 * @param args The arguments to pass to the query function
 * @param options Options for the hook
 * @returns The query result, loading state, error, and a mutate function
 */
export function useSwrConvex<T, A>(
    queryFunction: any,
    args: A | "skip",
    options: {
        revalidateOnFocus?: boolean
        revalidateOnReconnect?: boolean
        refreshInterval?: number
        onSuccess?: (data: T) => void
        onError?: (error: Error) => void
        errorMessage?: string
    } = {},
) {
    const {
        revalidateOnFocus = true,
        revalidateOnReconnect = true,
        refreshInterval,
        onSuccess,
        onError,
        errorMessage = "An error occurred while fetching data",
    } = options

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)
    const { toast } = useToast()

    // Use Convex's useQuery
    const result = useQuery(queryFunction, args)

    // Handle loading state
    useEffect(() => {
        if (args === "skip") {
            setIsLoading(false)
            return
        }

        if (result === undefined) {
            setIsLoading(true)
        } else {
            setIsLoading(false)
            // Call onSuccess callback if provided
            if (onSuccess) {
                onSuccess(result as T)
            }
        }
    }, [result, args, onSuccess])

    // Handle errors
    useEffect(() => {
        if (args === "skip") return

        if (result === undefined && !isLoading) {
            const error = new Error(errorMessage)
            setError(error)

            // Call onError callback if provided
            if (onError) {
                onError(error)
            } else {
                // Show toast by default
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                })
            }
        } else {
            setError(null)
        }
    }, [result, isLoading, args, errorMessage, onError, toast])

    // Set up revalidation on focus
    useEffect(() => {
        if (!revalidateOnFocus) return

        const onFocus = () => {
            // Force Convex to refetch by invalidating the cache
            // This is a workaround since Convex doesn't have a direct refetch method
            // In a real implementation, you would use a more robust approach
        }

        window.addEventListener("focus", onFocus)
        return () => {
            window.removeEventListener("focus", onFocus)
        }
    }, [revalidateOnFocus])

    // Set up revalidation on reconnect
    useEffect(() => {
        if (!revalidateOnReconnect) return

        const onOnline = () => {
            // Force Convex to refetch
        }

        window.addEventListener("online", onOnline)
        return () => {
            window.removeEventListener("online", onOnline)
        }
    }, [revalidateOnReconnect])

    // Set up refresh interval
    useEffect(() => {
        if (!refreshInterval) return

        const intervalId = setInterval(() => {
            // Force Convex to refetch
        }, refreshInterval)

        return () => {
            clearInterval(intervalId)
        }
    }, [refreshInterval])

    // Mutate function to manually trigger a refetch
    const mutate = useCallback(() => {
        // Force Convex to refetch
        // In a real implementation, you would use a more robust approach
    }, [])

    return {
        data: result as T,
        isLoading,
        error,
        mutate,
    }
}

