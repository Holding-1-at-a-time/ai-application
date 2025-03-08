"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { logError } from "@/lib/sentry"
import { ErrorType } from "@/lib/error-handler"
import { ErrorMessage } from "@/components/ui/error-message"

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        // Log error to monitoring service
        logError(error, {
            context: "error-boundary",
            componentStack: errorInfo.componentStack,
        })

        this.setState({ errorInfo })
    }

    // Determine error type based on error message
    getErrorType(): ErrorType {
        const { error } = this.state

        if (!error) return ErrorType.UNKNOWN

        if (error.message.includes("authentication") || error.message.includes("not logged in")) {
            return ErrorType.AUTHENTICATION
        }

        if (error.message.includes("permission") || error.message.includes("not authorized")) {
            return ErrorType.AUTHORIZATION
        }

        if (error.message.includes("not found") || error.message.includes("does not exist")) {
            return ErrorType.NOT_FOUND
        }

        if (error.message.includes("network") || error.message.includes("fetch")) {
            return ErrorType.NETWORK
        }

        return ErrorType.UNKNOWN
    }

    render() {
        if (this.state.hasError) {
            // Check if a custom fallback was provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            const errorType = this.getErrorType()

            return (
                <Card className="mx-auto max-w-md my-8">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            <CardTitle>Something went wrong</CardTitle>
                        </div>
                        <CardDescription>An error occurred while rendering this component</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ErrorMessage
                            type={errorType}
                            message={this.state.error?.message || "An unexpected error occurred"}
                            className="mb-4"
                        />

                        {process.env.NODE_ENV === "development" && this.state.errorInfo && (
                            <div className="mt-4">
                                <details className="text-xs">
                                    <summary className="cursor-pointer text-sm font-medium">Stack trace</summary>
                                    <pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-2 text-xs">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                </details>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button
                            onClick={() => {
                                this.setState({ hasError: false, error: undefined, errorInfo: undefined })
                                window.location.reload()
                            }}
                        >
                            Try again
                        </Button>
                    </CardFooter>
                </Card>
            )
        }

        return this.props.children
    }
}

export function ErrorBoundaryWrapper({
    children,
    fallback,
}: { children: React.ReactNode; fallback?: React.ReactNode }) {
    return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>
}

