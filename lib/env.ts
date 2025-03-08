/**
 * Server-side environment variables
 * These are only accessible in server components and API routes
 */
export const serverEnv = {
    // Clerk authentication
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,

    // Convex database
    CONVEX_DEPLOYMENT: process.env.CONVEX_DEPLOYMENT,
    CONVEX_ADMIN_KEY: process.env.CONVEX_ADMIN_KEY,

    // AI services
    OLLAMA_API_KEY: process.env.OLLAMA_API_KEY,

    // Logging and monitoring
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,

    // Other server-only variables
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
}

/**
 * Public environment variables
 * These are accessible in both client and server components
 * IMPORTANT: Do not include sensitive data here
 */
export const publicEnv = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/login",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/register",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/dashboard",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/dashboard",

    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,

    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || "development",
}

/**
 * Validate that required environment variables are set
 * This should be called in server components that need specific env vars
 * @param keys Array of required environment variable keys
 * @throws Error if any required variables are missing
 */
export function validateEnvVars(keys: (keyof typeof serverEnv)[]) {
    const missing = keys.filter((key) => !serverEnv[key])

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`)
    }
}

