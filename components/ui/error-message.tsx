"use client"

import { AlertCircle, AlertTriangle, Info, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ErrorType } from "@/lib/error-handler"

interface ErrorMessageProps {
    title?: string
    message: string
    type?: ErrorType
    className?: string
    onRetry?: () => void
}

export function ErrorMessage({ title, message, type = ErrorType.UNKNOWN, className, onRetry }: ErrorMessageProps) {
    // Determine alert variant based on error type
    let variant: "default" | "destructive" | "outline" = "default"
    let icon = Info

    switch (type) {
        case ErrorType.AUTHENTICATION:
        case ErrorType.AUTHORIZATION:
            variant = "outline"
            icon = AlertCircle
            break
        case ErrorType.VALIDATION:
        case ErrorType.CONFLICT:
            variant = "outline"
            icon = AlertTriangle
            break
        case ErrorType.NOT_FOUND:
        case ErrorType.RATE_LIMIT:
        case ErrorType.NETWORK:
            variant = "outline"
            icon = XCircle
            break
        case ErrorType.SERVER:
        case ErrorType.UNKNOWN:
        default:
            variant = "destructive"
            icon = XCircle
            break
    }

    // Determine title based on error type if not provided
    const alertTitle =
        title ||
        (() => {
            switch (type) {
                case ErrorType.AUTHENTICATION:
                    return "Authentication Required"
                case ErrorType.AUTHORIZATION:
                    return "Permission Denied"
                case ErrorType.VALIDATION:
                    return "Invalid Input"
                case ErrorType.NOT_FOUND:
                    return "Not Found"
                case ErrorType.CONFLICT:
                    return "Conflict Error"
                case ErrorType.RATE_LIMIT:
                    return "Rate Limit Exceeded"
                case ErrorType.NETWORK:
                    return "Network Error"
                case ErrorType.SERVER:
                    return "Server Error"
                case ErrorType.UNKNOWN:
                default:
                    return "Error"
            }
        })()

    return (
        <Alert variant={variant} className={className}>
            <icon className="h-4 w-4" />
            <AlertTitle>{alertTitle}</AlertTitle>
            <AlertDescription>
                <div className="mt-2">{message}</div>
                {onRetry && (
                    <button onClick={onRetry} className="mt-2 text-sm font-medium underline hover:text-primary">
                        Try again
                    </button>
                )}
            </AlertDescription>
        </Alert>
    )
}

