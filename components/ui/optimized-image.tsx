"use client"

import { useState, useEffect, useRef, memo } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
    src: string
    alt: string
    width?: number
    height?: number
    fill?: boolean
    sizes?: string
    priority?: boolean
    quality?: number
    className?: string
    objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down"
    onLoad?: () => void
    placeholder?: "blur" | "empty"
    blurDataURL?: string
    loading?: "lazy" | "eager"
}

export const OptimizedImage = memo(
    ({
        src,
        alt,
        width,
        height,
        fill = false,
        sizes,
        priority = false,
        quality = 80,
        className,
        objectFit = "cover",
        onLoad,
        placeholder = "empty",
        blurDataURL,
        loading = "lazy",
    }: OptimizedImageProps) => {
        const [isLoaded, setIsLoaded] = useState(false)
        const [isInView, setIsInView] = useState(false)
        const imgRef = useRef<HTMLDivElement>(null)

        // Generate a default blur data URL if not provided
        const defaultBlurDataURL =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEtAJJXIDTjwAAAABJRU5ErkJggg=="

        // Set up intersection observer for lazy loading
        useEffect(() => {
            if (!imgRef.current || priority) {
                setIsInView(true)
                return
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            setIsInView(true)
                            observer.disconnect()
                        }
                    })
                },
                {
                    rootMargin: "200px", // Load images 200px before they come into view
                    threshold: 0.1,
                },
            )

            observer.observe(imgRef.current)

            return () => {
                if (observer) {
                    observer.disconnect()
                }
            }
        }, [priority])

        // Handle image load
        const handleImageLoad = () => {
            setIsLoaded(true)
            if (onLoad) onLoad()
        }

        return (
            <div
                ref={imgRef}
                className={cn("overflow-hidden", !isLoaded && "bg-muted animate-pulse", className)}
                style={{
                    position: fill ? "relative" : "static",
                    width: fill ? "100%" : width,
                    height: fill ? "100%" : height,
                }}
            >
                {(isInView || priority) && (
                    <Image
                        src={src || "/placeholder.svg"}
                        alt={alt}
                        width={fill ? undefined : width}
                        height={fill ? undefined : height}
                        fill={fill}
                        sizes={sizes}
                        priority={priority}
                        quality={quality}
                        onLoad={handleImageLoad}
                        className={cn(
                            "transition-opacity duration-300",
                            isLoaded ? "opacity-100" : "opacity-0",
                            objectFit === "contain" && "object-contain",
                            objectFit === "cover" && "object-cover",
                            objectFit === "fill" && "object-fill",
                            objectFit === "none" && "object-none",
                            objectFit === "scale-down" && "object-scale-down",
                        )}
                        placeholder={placeholder}
                        blurDataURL={blurDataURL || defaultBlurDataURL}
                        loading={loading}
                    />
                )}
            </div>
        )
    },
)

OptimizedImage.displayName = "OptimizedImage"

