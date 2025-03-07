"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useQuery, useAction, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send, ArchiveIcon, Clock, Search, ArrowUp, PlusCircle, Bot } from "lucide-react"

interface BusinessAssistantProps {
    organizationId: string
}

export default function BusinessAssistant({ organizationId }: BusinessAssistantProps) {
    const [query, setQuery] = useState("")
    const [activeTab, setActiveTab] = useState("chat")
    const [activeConversation, setActiveConversation] = useState<string | null>(null)
    const [isQuerying, setIsQuerying] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Get conversations
    const conversations = useQuery(api.assistant.getUserConversations, {
        organizationId,
        includeArchived: false,
    })

    // Get active conversation
    const conversation = useQuery(
        api.assistant.getConversationById,
        activeConversation ? { conversationId: activeConversation } : "skip",
    )

    // Actions and mutations
    const queryAssistant = useAction(api.assistant.queryBusinessAssistant)
    const addMessage = useMutation(api.assistant.addMessageToConversation)
    const archiveConversation = useMutation(api.assistant.toggleConversationArchived)

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [conversation?.messages])

    // Handle query submission
    const handleSubmitQuery = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim()) return

        setIsQuerying(true)
        try {
            if (activeConversation) {
                // Add user message
                await addMessage({
                    conversationId: activeConversation,
                    message: {
                        role: "user",
                        content: query,
                    },
                })
            }

            // Query assistant
            const result = await queryAssistant({
                organizationId,
                conversationId: activeConversation || undefined,
                query,
                stream: false,
            })

            if (!activeConversation && result?.text) {
                // A new conversation was created - refresh
                setActiveTab("history")
                setTimeout(() => {
                    setActiveTab("chat")
                }, 100)
            }

            setQuery("")
        } catch (error) {
            console.error("Error querying assistant:", error)
            toast({
                title: "Query failed",
                description: "Failed to get a response from the assistant. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsQuerying(false)
        }
    }

    // Start new conversation
    const handleNewConversation = () => {
        setActiveConversation(null)
        setQuery("")
        setActiveTab("chat")
    }

    // Select conversation
    const handleSelectConversation = (id: string) => {
        setActiveConversation(id)
        setActiveTab("chat")
    }

    // Archive conversation
    const handleArchiveConversation = async () => {
        if (!activeConversation) return

        try {
            await archiveConversation({
                conversationId: activeConversation,
                isArchived: true,
            })

            toast({
                title: "Conversation archived",
                description: "The conversation has been archived.",
            })

            setActiveConversation(null)
        } catch (error) {
            console.error("Error archiving conversation:", error)
            toast({
                title: "Archive failed",
                description: "Failed to archive conversation. Please try again.",
                variant: "destructive",
            })
        }
    }

    // Format timestamp
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp)
        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
        }).format(date)
    }

    return (
        <Card className="h-[700px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Bot className="mr-2 h-5 w-5 text-primary" />
                    Business Intelligence Assistant
                </CardTitle>
                <CardDescription>Ask questions about your business data and get AI-powered insights</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
                <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="chat">
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Chat
                        </TabsTrigger>
                        <TabsTrigger value="history">
                            <Clock className="mr-2 h-4 w-4" />
                            History
                        </TabsTrigger>
                    </TabsList>

                    {/* Chat Tab */}
                    <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden">
                        {activeConversation && conversation ? (
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium">{conversation.title}</h3>
                                    <Button variant="ghost" size="icon" onClick={handleArchiveConversation} title="Archive conversation">
                                        <ArchiveIcon className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Chat messages */}
                                <div className="flex-1 overflow-y-auto mb-4 pr-2">
                                    <div className="space-y-4">
                                        {conversation.messages.map((message, index) => (
                                            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                                <div
                                                    className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                                        }`}
                                                >
                                                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                                    <div className="text-xs mt-1 opacity-70 text-right">{formatTimestamp(message.timestamp)}</div>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center flex-1 text-center">
                                <Bot className="h-16 w-16 text-muted-foreground/40 mb-4" />
                                <h3 className="text-xl font-medium mb-2">Business Intelligence Assistant</h3>
                                <p className="text-muted-foreground mb-6 max-w-md">
                                    Ask questions about your business data, trends, and performance to get AI-powered insights and
                                    recommendations.
                                </p>
                            </div>
                        )}

                        {/* Chat input */}
                        <form onSubmit={handleSubmitQuery} className="mt-auto">
                            <div className="relative">
                                <Textarea
                                    placeholder="Ask a question about your business..."
                                    className="pr-12 resize-none"
                                    rows={3}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    disabled={isQuerying}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="absolute right-2 bottom-2"
                                    disabled={!query.trim() || isQuerying}
                                >
                                    {isQuerying ? <ArrowUp className="h-4 w-4 animate-bounce" /> : <Send className="h-4 w-4" />}
                                </Button>
                            </div>
                        </form>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="flex-1 overflow-hidden flex flex-col">
                        {!conversations ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        ) : (
                            <>
                                <div className="mb-4 flex justify-between items-center">
                                    <Input
                                        placeholder="Search conversations..."
                                        className="max-w-sm"
                                        prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                                    />
                                    <Button onClick={handleNewConversation} variant="outline" size="sm">
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        New Conversation
                                    </Button>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-2">
                                    {conversations.length === 0 ? (
                                        <div className="text-center py-6 text-muted-foreground">
                                            <Clock className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                            <p>No conversations yet.</p>
                                            <Button onClick={handleNewConversation} variant="link" className="mt-2">
                                                Start a new conversation
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {conversations.map((conv) => (
                                                <div
                                                    key={conv._id}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${activeConversation === conv._id ? "bg-primary/10 border-primary/50" : "hover:bg-muted/50"
                                                        }`}
                                                    onClick={() => handleSelectConversation(conv._id)}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-medium text-sm line-clamp-1">{conv.title}</h4>
                                                        <span className="text-xs text-muted-foreground">{formatTimestamp(conv.updatedAt)}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                        {conv.messages.length > 0
                                                            ? conv.messages[conv.messages.length - 1].content
                                                            : "Empty conversation"}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

