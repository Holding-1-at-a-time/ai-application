"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useChat } from "ai/react"
import { Loader2, Send, AlertCircle, Bot, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { sanitizeInput } from "@/lib/sanitize"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ErrorMessage } from "@/components/ui/error-message"
import { ErrorType } from "@/lib/error-handler"
import { CsrfForm } from "@/components/ui/csrf-form"
import { LoadingState } from "@/components/ui/loading-state"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

export function AIChat() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [isAIAvailable, setIsAIAvailable] = useState(true)
    const [retryCount, setRetryCount] = useState(0)
    const [errorType, setErrorType] = useState<ErrorType | null>(null)

    const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, setMessages } = useChat({
        api: "/api/chat",
        body: {
            businessId: user?.businessId,
        },
        onError: (error) => {
            console.error("Chat error:", error)

            // Determine error type
            let type = ErrorType.UNKNOWN

            if (
                error.message.includes("Failed to fetch") ||
                error.message.includes("NetworkError") ||
                error.message.includes("timeout")
            ) {
                type = ErrorType.NETWORK
                setIsAIAvailable(false)
            } else if (error.message.includes("rate limit") || error.message.includes("too many requests")) {
                type = ErrorType.RATE_LIMIT
            } else if (error.message.includes("CSRF")) {
                type = ErrorType.AUTHORIZATION
            }

            setErrorType(type)

            toast({
                title: "Error",
                description: "There was a problem with the AI assistant. Please try again.",
                variant: "destructive",
            })
        },
        onFinish: () => {
            // Reset error state
            setErrorType(null)

            // Reset AI availability if it was previously unavailable
            if (!isAIAvailable && retryCount > 0) {
                setIsAIAvailable(true)
                setRetryCount(0)
            }
        },
    })

    const scrollAreaRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom when messages change
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
        }
    }, [messages])

    // Handle input submission with sanitization
    const handleSanitizedSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()

            // Don't submit empty messages
            if (!input.trim()) return

            // Reset error state
            setErrorType(null)

            // Sanitize input before submission
            const sanitizedInput = sanitizeInput(input)

            // Create a temporary message array with the sanitized input
            const updatedMessages = [
                ...messages,
                { id: Date.now().toString(), role: "user", content: sanitizedInput } as Message,
            ]

            // Update the UI immediately
            setMessages(updatedMessages)

            // Submit the sanitized input
            handleSubmit(e, { data: { messages: updatedMessages, businessId: user?.businessId } })
        },
        [input, messages, setMessages, handleSubmit, user?.businessId],
    )

    // Retry connection to AI service
    const handleRetry = useCallback(() => {
        setRetryCount((prev) => prev + 1)
        setIsAIAvailable(true)
        setErrorType(null)

        // Add a system message to indicate retry
        if (messages.length > 0) {
            reload()
        }
    }, [messages.length, reload])

    return (
        <Card className="w-full h-[calc(100vh-13rem)]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" aria-hidden="true" />
                    <span>AI Assistant</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-20rem)] p-4" ref={scrollAreaRef} aria-label="Chat messages">
                    {!isAIAvailable && (
                        <Alert variant="destructive" className="mb-4" role="alert">
                            <AlertCircle className="h-4 w-4" aria-hidden="true" />
                            <AlertTitle>AI Service Unavailable</AlertTitle>
                            <AlertDescription>
                                The AI assistant is currently unavailable. Please try again later or contact support.
                            </AlertDescription>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRetry}
                                className="mt-2 focus-visible:ring-ring"
                                aria-label="Retry connection"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                                Retry Connection
                            </Button>
                        </Alert>
                    )}

                    {errorType && (
                        <ErrorMessage
                            type={errorType}
                            message={
                                errorType === ErrorType.RATE_LIMIT
                                    ? "You've sent too many messages. Please wait a moment before trying again."
                                    : "There was a problem with the AI assistant. Please try again."
                            }
                            onRetry={handleRetry}
                            className="mb-4"
                        />
                    )}

                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8" aria-live="polite">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Avatar>
                                    <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                            </div>
                            <h3 className="font-semibold text-xl">How can I help you today?</h3>
                            <p className="text-muted-foreground mt-2">
                                Ask me anything about our detailing services, booking availability, or how to use the system.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4" aria-live="polite">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    aria-label={`${message.role === "user" ? "You" : "AI Assistant"}: ${message.content}`}
                                >
                                    <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                                        <Avatar>
                                            {message.role === "user" ? (
                                                <AvatarFallback>U</AvatarFallback>
                                            ) : (
                                                <AvatarFallback>AI</AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div
                                            className={`rounded-lg px-4 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                                }`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start" aria-live="polite" aria-atomic="true">
                                    <div className="flex gap-3 max-w-[80%]">
                                        <Avatar>
                                            <AvatarFallback>AI</AvatarFallback>
                                        </Avatar>
                                        <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                                            <LoadingState size="sm" text="Thinking..." className="flex-row" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && !errorType && (
                                <div className="flex justify-center" role="alert">
                                    <Alert variant="destructive" className="max-w-[80%]">
                                        <AlertCircle className="h-4 w-4" aria-hidden="true" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>
                                            {error.message || "There was a problem with the AI assistant. Please try again."}
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
            <CardFooter className="border-t p-4">
                <CsrfForm
                    onSubmit={handleSanitizedSubmit}
                    className="flex w-full items-center space-x-2"
                    aria-label="Chat input form"
                >
                    <Input
                        id="message"
                        placeholder="Type your message..."
                        className="flex-1 focus-visible:ring-ring"
                        autoComplete="off"
                        value={input}
                        onChange={handleInputChange}
                        disabled={isLoading || !isAIAvailable}
                        aria-label="Type your message"
                        aria-disabled={isLoading || !isAIAvailable}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !input.trim() || !isAIAvailable}
                        className="shadow-glow focus-visible:ring-ring"
                        aria-label="Send message"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        ) : (
                            <Send className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">Send</span>
                    </Button>
                </CsrfForm>
            </CardFooter>
        </Card>
    )
}

