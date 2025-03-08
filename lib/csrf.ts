import { cookies } from "next/headers"
import { nanoid } from "nanoid"

// CSRF token configuration
const CSRF_TOKEN_COOKIE = "csrf_token"
const CSRF_TOKEN_HEADER = "x-csrf-token"
const CSRF_TOKEN_EXPIRY = 60 * 60 * 24 // 24 hours in seconds

/**
 * Generate a CSRF token and store it in a cookie
 * @returns The generated CSRF token
 */
export function generateCsrfToken(): string {
    const token = nanoid(32)

    // Set the CSRF token in a cookie
    cookies().set({
        name: CSRF_TOKEN_COOKIE,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: CSRF_TOKEN_EXPIRY,
    })

    return token
}

/**
 * Get the current CSRF token from cookies or generate a new one
 * @returns The current CSRF token
 */
export function getCsrfToken(): string {
    const cookieStore = cookies()
    const token = cookieStore.get(CSRF_TOKEN_COOKIE)?.value

    if (token) {
        return token
    }

    return generateCsrfToken()
}

/**
 * Validate a CSRF token against the stored token
 * @param token The token to validate
 * @returns Whether the token is valid
 */
export function validateCsrfToken(token: string): boolean {
    const cookieStore = cookies()
    const storedToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value

    if (!storedToken || !token) {
        return false
    }

    return token === storedToken
}

/**
 * CSRF protection middleware for Next.js
 * @param req The incoming request
 * @returns Result of CSRF validation
 */
export async function csrfProtection(req: Request): Promise<{ success: boolean }> {
    // Skip CSRF check for GET requests and API routes that handle their own CSRF
    if (req.method === "GET" || req.url.includes("/api/webhook")) {
        return { success: true }
    }

    try {
        const token = req.headers.get(CSRF_TOKEN_HEADER)

        if (!token) {
            return { success: false }
        }

        const isValid = validateCsrfToken(token)

        return { success: isValid }
    } catch (error) {
        console.error("CSRF validation error:", error)
        return { success: false }
    }
}

/**
 * React hook to get CSRF token and header for forms
 * This is used client-side to add CSRF tokens to requests
 */
export function useCsrfToken() {
    return {
        csrfToken: getCsrfToken(),
        csrfHeader: CSRF_TOKEN_HEADER,
    }
}

