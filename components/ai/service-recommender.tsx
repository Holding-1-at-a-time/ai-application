"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Car, Calendar, ArrowRight } from "lucide-react"

interface ServiceRecommenderProps {
    customerId?: string
    vehicleData?: any
    organizationId: string
}

export default function ServiceRecommender({ customerId, vehicleData, organizationId }: ServiceRecommenderProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Get customer data if customerId is provided
    const customerData = useQuery(api.customers.getCustomerById, customerId ? { customerId } : "skip")

    // Get service history if customerId is provided
    const serviceHistory = useQuery(
        api.appointments.getCustomerAppointments,
        customerId ? { customerId, limit: 5 } : "skip",
    )

    // Get available services
    const availableServices = useQuery(api.services.getActiveServices, { organizationId })

    // Setup AI chat for recommendations
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: "/api/ai/service-recommendations",
        initialMessages: [
            {
                id: "init",
                role: "system",
                content:
                    "I'm your auto detailing service advisor. I'll analyze your vehicle data and service history to recommend the best services for your vehicle.",
            },
        ],
        body: {
            customerData,
            vehicleData,
            serviceHistory,
            availableServices,
            organizationId,
        },
    })

    // Get the latest assistant message
    const lastMessage = messages.filter((m) => m.role === "assistant").pop()

    // Parse recommendations if available
    const recommendations = lastMessage?.content ? JSON.parse(lastMessage.content) : null

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-primary" />
                    AI Service Recommendations
                </CardTitle>
                <CardDescription>Personalized service suggestions based on vehicle data and history</CardDescription>
            </CardHeader>
            <CardContent>
                {!recommendations ? (
                    <div className="flex flex-col items-center justify-center py-6">
                        <Car className="h-12 w-12 text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground text-center">
                            {customerId
                                ? "Analyzing vehicle data to generate personalized recommendations..."
                                : "Select a customer to get personalized service recommendations"}
                        </p>
                        {customerId && (
                            <Button
                                variant="outline"
                                className="mt-4"
                                onClick={() => handleSubmit({ preventDefault: () => { } } as any)}
                                disabled={isLoading}
                            >
                                {isLoading ? "Analyzing..." : "Generate Recommendations"}
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10 border">
                                <AvatarImage src={vehicleData?.image || "/placeholder.svg?height=40&width=40"} alt="Vehicle" />
                                <AvatarFallback>
                                    <Car className="h-5 w-5" />
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-medium">
                                    {vehicleData?.make} {vehicleData?.model} ({vehicleData?.year})
                                </h3>
                                <p className="text-sm text-muted-foreground">{recommendations.summary}</p>
                            </div>
                        </div>

                        <div className="space-y-3 mt-4">
                            {recommendations.services.map((rec: any, index: number) => (
                                <div key={index} className="border rounded-lg p-3 hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-medium">{rec.name}</h4>
                                        <Badge
                                            variant={
                                                rec.priority === "High" ? "destructive" : rec.priority === "Medium" ? "default" : "secondary"
                                            }
                                        >
                                            {rec.priority} Priority
                                        </Badge>
                                    </div>
                                    <p className="text-sm mt-1">{rec.reason}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm font-medium">${rec.price}</span>
                                        <Button size="sm" variant="outline">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Schedule
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? "Show Less" : "Show Details"}
                </Button>
                {recommendations && (
                    <Button size="sm">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Send to Customer
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

