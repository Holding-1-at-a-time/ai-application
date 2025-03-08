"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useCsrfToken } from "@/lib/csrf"

interface CsrfFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
    children: React.ReactNode
}

export function CsrfForm({ children, ...props }: CsrfFormProps) {
    const { csrfToken, csrfHeader } = useCsrfToken()
    const [token, setToken] = useState<string | null>(null)

    // Set token after component mounts to avoid hydration mismatch
    useEffect(() => {
        setToken(csrfToken)
    }, [csrfToken])

    // Intercept the form submission to add CSRF token
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        if (props.onSubmit) {
            // Add CSRF token to the request headers
            const originalSubmit = event.nativeEvent.submitter as HTMLElement

            if (originalSubmit) {
                originalSubmit.setAttribute("disabled", "true")
            }

            try {
                // Call the original onSubmit handler
                await props.onSubmit(event)
            } finally {
                if (originalSubmit) {
                    originalSubmit.removeAttribute("disabled")
                }
            }
        }
    }

    return (
        <form {...props} onSubmit={handleSubmit}>
            {/* Hidden input for CSRF token */}
            {token && <input type="hidden" name={csrfHeader} value={token} />}
            {children}
        </form>
    )
}

