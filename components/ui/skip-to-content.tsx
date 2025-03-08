"use client"

import { useA11y } from "./a11y-provider"

export function SkipToContent() {
    const { skipToContent } = useA11y()

    return (
        <a
            href="#main-content"
            onClick={(e) => {
                e.preventDefault()
                skipToContent()
            }}
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:shadow-glow"
        >
            Skip to content
        </a>
    )
}

