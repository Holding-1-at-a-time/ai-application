"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type A11yContextType = {
    focusVisible: boolean
    setFocusVisible: (visible: boolean) => void
    skipToContent: () => void
}

const A11yContext = createContext<A11yContextType | undefined>(undefined)

export function A11yProvider({ children }: { children: React.ReactNode }) {
    const [focusVisible, setFocusVisible] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab") {
                setFocusVisible(true)
            }
        }

        const handleMouseDown = () => {
            setFocusVisible(false)
        }

        window.addEventListener("keydown", handleKeyDown)
        window.addEventListener("mousedown", handleMouseDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
            window.removeEventListener("mousedown", handleMouseDown)
        }
    }, [])

    const skipToContent = () => {
        const mainContent = document.getElementById("main-content")
        if (mainContent) {
            mainContent.focus()
            mainContent.scrollIntoView()
        }
    }

    return (
        <A11yContext.Provider value={{ focusVisible, setFocusVisible, skipToContent }}>{children}</A11yContext.Provider>
    )
}

export function useA11y() {
    const context = useContext(A11yContext)
    if (context === undefined) {
        throw new Error("useA11y must be used within an A11yProvider")
    }
    return context
}

