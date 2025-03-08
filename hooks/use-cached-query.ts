"use client"

import { useQuery as useConvexQuery } from "convex/react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"

interface CacheOptions {
    enabled?: boolean
    staleTime?: number
    cacheTime?: number
    refetchOnWindowFocus?: boolean
    refetchOnReconnect?: boolean
    refetchInterval?: number | false
    onSuccess?: (data: any) => void
    onError?: (error: Error) => void
    errorMessage?: string
}

interface CacheResult<T> {
    data: T | undefined
    isLoading: boolean
    isError: boolean
    error: Error | null
    refetch: () => void
    isFetching: boolean
}

// Create a simple in-memory cache
const queryCache = new Map<string, { data: any; timestamp: number }>()

export function useCachedQuery<T>(queryFn: any, args: any, options: CacheOptions = {}): CacheResult<T> {
    const {
        enabled = true,
        staleTime = 5 * 60 * 1000, // 5 minutes
        cacheTime = 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus = true,
        refetchOnReconnect = true,
        refetchInterval = false,
        onSuccess,
        onError,
        errorMessage = "An error occurred while fetching data",
    } = options

    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [isError, setIsError] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [isFetching, setIsFetching] = useState(false)
    const [forceRefetch, setForceRefetch] = useState(0)

    // Generate a cache key based on the query function and arguments
    const cacheKey = JSON.stringify({ fn: queryFn.name, args })

    // Store the latest data in a ref to avoid unnecessary re-renders
    const latestDataRef = useRef<T | undefined>(undefined)

    // Use Convex's useQuery
    const result = useConvexQuery(queryFn, args === "skip" || !enabled ? "skip" : args)

    // Check cache and update data
    useEffect(() => {
        if (args === "skip" || !enabled) {
            setIsLoading(false)
            return
        }

        const cachedResult = queryCache.get(cacheKey)

        if (cachedResult && Date.now() - cachedResult.timestamp < staleTime) {
            // Use cached data if it's not stale
            latestDataRef.current = cachedResult.data
            setIsLoading(false)
            if (onSuccess) onSuccess(cachedResult.data)
        } else {
            // Mark as loading if we don't have cached data
            if (!cachedResult) {
                setIsLoading(true)
            }
            setIsFetching(true)
        }
    }, [cacheKey, args, enabled, staleTime, onSuccess])

    // Handle result from Convex query
    useEffect(() => {
        if (args === "skip" || !enabled) return

        if (result !== undefined) {
            // Update cache
            queryCache.set(cacheKey, { data: result, timestamp: Date.now() })

            // Update state
            latestDataRef.current = result as T
            setIsLoading(false)
            setIsFetching(false)
            setIsError(false)
            setError(null)

            // Call onSuccess callback
            if (onSuccess) onSuccess(result)
        }
    }, [result, cacheKey, args, enabled, onSuccess])

    // Handle errors
    useEffect(() => {
        if (args === "skip" || !enabled) return

        if (result === undefined && !isLoading && !isFetching) {
            const err = new Error(errorMessage)
            setIsError(true)
            setError(err)

            // Call onError callback
            if (onError) {
                onError(err)
            } else {
                // Show toast by default
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                })
            }
        }
    }, [result, isLoading, isFetching, args, enabled, errorMessage, onError, toast])

    // Set up refetch on window focus
    useEffect(() => {
        if (!refetchOnWindowFocus) return

        const onFocus = () => {
            if (enabled) {
                setForceRefetch((prev) => prev + 1)
            }
        }

        window.addEventListener("focus", onFocus)
        return () => {
            window.removeEventListener("focus", onFocus)
        }
    }, [refetchOnWindowFocus, enabled])

    // Set up refetch on reconnect
    useEffect(() => {
        if (!refetchOnReconnect) return

        const onOnline = () => {
            if (enabled) {
                setForceRefetch((prev) => prev + 1)
            }
        }

        window.addEventListener("online", onOnline)
        return () => {
            window.removeEventListener("online", onOnline)
        }
    }, [refetchOnReconnect, enabled])

    // Set up interval refetch
    useEffect(() => {
        if (!refetchInterval || !enabled) return

        const intervalId = setInterval(() => {
            setForceRefetch((prev) => prev + 1)
        }, refetchInterval)

        return () => {
            clearInterval(intervalId)
        }
    }, [refetchInterval, enabled])

    // Clean up expired cache entries
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const now = Date.now()
            for (const [key, value] of queryCache.entries()) {
                if (now - value.timestamp > cacheTime) {
                    queryCache.delete(key)
                }
            }
        }, 60000) // Check every minute

        return () => {
            clearInterval(cleanupInterval)
        }
    }, [cacheTime])

    // Manual refetch function
    const refetch = useCallback(() => {
        setForceRefetch((prev) => prev + 1)
    }, [])

    // Return the result
    return {
        data: latestDataRef.current,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    }
}

