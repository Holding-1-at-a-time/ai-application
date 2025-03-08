"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useQuery as useConvexQuery } from "convex/react"
import { toast } from "@/components/ui/sonner"

interface SWROptions<T> {
    fallbackData?: T
    revalidateOnFocus?: boolean
    revalidateOnReconnect?: boolean
    refreshInterval?: number | false
    dedupingInterval?: number
    shouldRetryOnError?: boolean
    errorRetryCount?: number
    errorRetryInterval?: number
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    suspense?: boolean
}

interface SWRResponse<T> {
    data: T | undefined
    error: Error | null
    isLoading: boolean
    isValidating: boolean
    mutate: (data?: T | Promise<T> | ((currentData: T) => T | Promise<T>)) => Promise<T | undefined>
}

// Global cache for SWR
const CACHE = new Map<string, { data: any; timestamp: number }>()

export function useSWRQuery<T = any>(queryFn: any, args: any, options: SWROptions<T> = {}): SWRResponse<T> {
    const {
        fallbackData,
        revalidateOnFocus = true,
        revalidateOnReconnect = true,
        refreshInterval = false,
        dedupingInterval = 2000,
        shouldRetryOnError = true,
        errorRetryCount = 3,
        errorRetryInterval = 5000,
        onSuccess,
        onError,
        suspense = false,
    } = options

    const { toast } = useToast()
    const [data, setData] = useState<T | undefined>(fallbackData)
    const [error, setError] = useState<Error | null>(null)
    const [isLoading, setIsLoading] = useState(!fallbackData && !suspense)
    const [isValidating, setIsValidating] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const [key, setKey] = useState(0)

    // Generate a cache key based on the query function and arguments
    const cacheKey = JSON.stringify({ fn: queryFn.name, args })

    // Store the latest data in a ref to avoid unnecessary re-renders
    const latestDataRef = useRef<T | undefined>(fallbackData)

    // Store the timestamp of the last fetch to implement dedupingInterval
    const lastFetchTimeRef = useRef<number>(0)

    // Use Convex's useQuery
    const result = useConvexQuery(queryFn, args === "skip" ? "skip" : args)

    // Handle result from Convex query
    useEffect(() => {
        if (args === "skip") return

        if (result !== undefined) {
            // Update state and cache
            setData(result as T)
            setIsLoading(false)
            setIsValidating(false)
            setError(null)
            setRetryCount(0)

            // Update ref
            latestDataRef.current = result as T

            // Update cache
            CACHE.set(cacheKey, { data: result, timestamp: Date.now() })

            // Call onSuccess callback
            if (onSuccess) onSuccess(result as T)
        }
    }, [result, cacheKey, args, onSuccess])

    // Handle errors
    useEffect(() => {
        if (args === "skip") return

        if (result === undefined && !isLoading && !isValidating) {
            // Check if we should retry
            if (shouldRetryOnError && retryCount < errorRetryCount) {
                const timer = setTimeout(() => {
                    setRetryCount((prev) => prev + 1)
                    setKey((prev) => prev + 1)
                    setIsValidating(true)
                }, errorRetryInterval)

                return () => clearTimeout(timer)
            }

            const err = new Error("Failed to fetch data")
            setError(err)

            // Call onError callback
            if (onError) {
                onError(err)
            } else {
                // Show toast by default
                toast({
                    title: "Error",
                    description: "Failed to fetch data. Please try again.",
                    variant: "destructive",
                })
            }
        }
    }, [
        result,
        isLoading,
        isValidating,
        args,
        shouldRetryOnError,
        retryCount,
        errorRetryCount,
        errorRetryInterval,
        onError,
        toast,
    ])

    // Check cache on mount and when dependencies change
    useEffect(() => {
        if (args === "skip") return

        const cachedData = CACHE.get(cacheKey)

        if (cachedData) {
            setData(cachedData.data)
            latestDataRef.current = cachedData.data
            setIsLoading(false)

            // If data is stale, revalidate in the background
            const now = Date.now()
            if (refreshInterval && now - cachedData.timestamp > refreshInterval) {
                if (now - lastFetchTimeRef.current > dedupingInterval) {
                    setIsValidating(true)
                    setKey((prev) => prev + 1)
                    lastFetchTimeRef.current = now
                }
            }
        }
    }, [cacheKey, args, refreshInterval, dedupingInterval])

    // Set up revalidation on window focus
    useEffect(() => {
        if (!revalidateOnFocus) {
          return
        }

        const onFocus = () => {
            const now = Date.now()
            if (now - lastFetchTimeRef.current > dedupingInterval) {
                setIsValidating(true)
                setKey((prev) => prev + 1)
                lastFetchTimeRef.current = now
            }
        }

        window.addEventListener("focus", onFocus)
        return () => {
            window.removeEventListener("focus", onFocus)
        }
    }, [revalidateOnFocus, dedupingInterval])

    // Set up revalidation on reconnect
    useEffect(() => {
        if (!revalidateOnReconnect) {
          return
        }

        const onOnline = () => {
            const now = Date.now()
            if (now - lastFetchTimeRef.current > dedupingInterval) {
                setIsValidating(true)
                setKey((prev) => prev + 1)
                lastFetchTimeRef.current = now
            }
        }

        window.addEventListener("online", onOnline)
        return () => {
            window.removeEventListener("online", onOnline)
        }
    }, [revalidateOnReconnect, dedupingInterval])

    // Set up interval revalidation
    useEffect(() => {
        if (!refreshInterval) return

        const intervalId = setInterval(() => {
            const now = Date.now()
            if (now - lastFetchTimeRef.current > dedupingInterval) {
                setIsValidating(true)
                setKey((prev) => prev + 1)
                lastFetchTimeRef.current = now
            }
        }, refreshInterval)

        return () => {
            clearInterval(intervalId)
        }
    }, [refreshInterval, dedupingInterval])

    // Mutate function to manually update data and trigger revalidation
    const mutate = useCallback(
        async (newData?: T | Promise<T> | ((currentData: T) => T | Promise<T>)): Promise<T | undefined> => {
            try {
                // If no new data is provided, just trigger a revalidation
                if (newData === undefined) {
                    setIsValidating(true)
                    setKey((prev) => prev + 1)
                    lastFetchTimeRef.current = Date.now()
                    return latestDataRef.current
                }

                // If new data is a function, call it with current data
                if (typeof newData === "function") {
                    const updaterFn = newData as (currentData: T) => T | Promise<T>
                    const currentData = latestDataRef.current as T
                    const result = updaterFn(currentData)

                    // Handle both synchronous and asynchronous updater functions
                    if (result instanceof Promise) {
                        const resolvedData = await result
                        setData(resolvedData)
                        latestDataRef.current = resolvedData
                        CACHE.set(cacheKey, { data: resolvedData, timestamp: Date.now() })
                        return resolvedData
                    } else {
                        setData(result)
                        latestDataRef.current = result
                        CACHE.set(cacheKey, { data: result, timestamp: Date.now() })
                        return result
                    }
                }

                // If new data is a promise, await it
                if (newData instanceof Promise) {
                    const resolvedData = await newData
                    setData(resolvedData)
                    latestDataRef.current = resolvedData
                    CACHE.set(cacheKey, { data: resolvedData, timestamp: Date.now() })
                    return resolvedData
                }

                // Otherwise, use the provided data directly
                setData(newData)
                latestDataRef.current = newData
                CACHE.set(cacheKey, { data: newData, timestamp: Date.now() })
                return newData
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err))
                setError(error)
                if (onError) onError(error)
                return undefined
            } finally {
                // Trigger a revalidation after the update
                const now = Date.now()
                if (now - lastFetchTimeRef.current > dedupingInterval) {
                    setIsValidating(true)
                    setKey((prev) => prev + 1)
                    lastFetchTimeRef.current = now
                }
            }
        },
        [cacheKey, onError, dedupingInterval],
    )

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
    }
}

