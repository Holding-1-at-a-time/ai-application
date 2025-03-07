import { auth } from "@clerk/nextjs"
import { ConvexHttpClient } from "convex/browser"

/**
 * Gets an auth token for Convex API calls
 * This function is used to authenticate server-side requests to Convex
 */
export async function getAuthToken() {
    // Get the user's auth information from Clerk
    const { getToken } = auth()

    // Get a token for the Convex API
    const token = await getToken({ template: "convex" })

    if (!token) {
        throw new Error("Failed to get Convex auth token")
    }

    return token
}

/**
 * Creates an authenticated Convex client for server-side API calls
 */
export async function createServerClient() {
    const token = await getAuthToken()

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "")

    return { convex, token }
}

