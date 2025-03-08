"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface CacheContextType {
    clearApiCache: () => Promise<void>
    clearImageCache: () => Promise<void>
    clearAllCache: () => Promise<void>
    isCacheClearing: boolean
}

const CacheContext = createContext<CacheContextType | undefined>(undefined)

export function CacheProvider({ children }: { children: ReactNode }) {
    const [isCacheClearing, setIsCacheClearing] = useState(false)

    // Register cache worker
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/cache-worker.js")
                .then((registration) => {
                    console.log("Cache worker registered:", registration.scope)
                })
                .catch((error) => {
                    console.error("Cache worker registration failed:", error)
                })
        }
    }, [])

    // Clear API cache
    const clearApiCache = async () => {
        setIsCacheClearing(true)
        try {
            if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: "CLEAR_API_CACHE",
                })
            }

            // Also clear in-memory cache if any
            if (window.__CACHE_CLEAR_CALLBACK) {
                window.__CACHE_CLEAR_CALLBACK()
            }

            await new Promise((resolve) => setTimeout(resolve, 500))
        } finally {
            setIsCacheClearing(false)
        }
    }

    // Clear image cache
    const clearImageCache = async () => {
        setIsCacheClearing(true)
        try {
            if ("caches" in window) {
                await caches.delete("autodetail-images-v1")
            }
            await new Promise((resolve) => setTimeout(resolve, 500))
        } finally {
            setIsCacheClearing(false)
        }
    }

    // Clear all cache
    const clearAllCache = async () => {
        setIsCacheClearing(true)
        try {
            if ("caches" in window) {
                const cacheNames = await caches.keys()
                await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
            }

            // Also clear in-memory cache if any
            if (window.__CACHE_CLEAR_CALLBACK) {
                window.__CACHE_CLEAR_CALLBACK()
            }

            await new Promise((resolve) => setTimeout(resolve, 500))
        } finally {
            setIsCacheClearing(false)
        }
    }

    return (
        <CacheContext.Provider
            value={{
                clearApiCache,
                clearImageCache,
                clearAllCache,
                isCacheClearing,
            }}
        >
            {children}
        </CacheContext.Provider>
    )
}

export function useCache() {
    const context = useContext(CacheContext)
    if (context === undefined) {
        throw new Error("useCache must be used within a CacheProvider")
    }
    return context
}

// Add global type for cache clear callback
declare global {
    interface Window {
        __CACHE_CLEAR_CALLBACK?: () => void
    }
}

