/**
 * Environment configuration system for the automotive detailing application
 * This centralizes all environment variables and provides type-safe access
 */

// Define the environment types
export type AppEnvironment = "development" | "staging" | "production"

// Define the configuration interface
interface AppConfig {
    // App basics
    appName: string
    appUrl: string
    environment: AppEnvironment

    // API endpoints and keys
    convexUrl: string
    clerkPublishableKey: string

    // Feature flags
    enableAnalytics: boolean
    enableNotifications: boolean

    // Performance settings
    cacheDuration: number
    maxItemsPerPage: number
}

// Default configuration values
const defaultConfig: AppConfig = {
    appName: "Automotive Detailing System",
    appUrl: "http://localhost:3000",
    environment: "development",

    convexUrl: "",
    clerkPublishableKey: "",

    enableAnalytics: false,
    enableNotifications: false,

    cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
    maxItemsPerPage: 25,
}

// Environment-specific overrides
const environmentConfigs: Record<AppEnvironment, Partial<AppConfig>> = {
    development: {
        enableAnalytics: false,
        cacheDuration: 1 * 60 * 1000, // 1 minute in development
    },
    staging: {
        enableAnalytics: true,
        enableNotifications: true,
        cacheDuration: 3 * 60 * 1000, // 3 minutes in staging
    },
    production: {
        enableAnalytics: true,
        enableNotifications: true,
        cacheDuration: 10 * 60 * 1000, // 10 minutes in production
        maxItemsPerPage: 50,
    },
}

// Load environment variables
const loadEnvironmentVariables = (): Partial<AppConfig> => {
    return {
        appUrl: process.env.NEXT_PUBLIC_APP_URL || defaultConfig.appUrl,
        environment: (process.env.NEXT_PUBLIC_APP_ENV as AppEnvironment) || defaultConfig.environment,
        convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL || defaultConfig.convexUrl,
        clerkPublishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || defaultConfig.clerkPublishableKey,
    }
}

// Build the final configuration
const buildConfig = (): AppConfig => {
    const envVariables = loadEnvironmentVariables()
    const environment = envVariables.environment || defaultConfig.environment
    const envConfig = environmentConfigs[environment]

    return {
        ...defaultConfig,
        ...envConfig,
        ...envVariables,
    }
}

// Export the configuration
export const config = buildConfig()

// Helper function to check if we're in a specific environment
export const isEnvironment = (env: AppEnvironment): boolean => {
    return config.environment === env
}

// Helper function to check if we're in a production-like environment
export const isProductionLike = (): boolean => {
    return ["production", "staging"].includes(config.environment)
}

