import { config } from "./config"

/**
 * Validates that all required environment variables are set
 * @returns An object with validation status and any missing variables
 */
export function validateConfig() {
    const requiredVariables = [
        { key: "convexUrl", value: config.convexUrl },
        { key: "clerkPublishableKey", value: config.clerkPublishableKey },
        { key: "appUrl", value: config.appUrl },
    ]

    const missingVariables = requiredVariables.filter(({ value }) => !value).map(({ key }) => key)

    return {
        isValid: missingVariables.length === 0,
        missingVariables,
    }
}

/**
 * Validates the environment configuration and throws an error if invalid
 * Use this during application initialization to fail fast
 */
export function validateConfigOrThrow() {
    const { isValid, missingVariables } = validateConfig()

    if (!isValid) {
        throw new Error(
            `Missing required environment variables: ${missingVariables.join(", ")}. ` +
            "Please check your .env file or environment configuration.",
        )
    }
}

