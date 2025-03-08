"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Car } from "lucide-react"

interface RecentAppointmentsProps {
    data: {
        id: string
        customerName: string
        customerImage?: string
        service: string
        vehicle: string
        date: string
        time: string
        status: "completed" | "scheduled" | "in-progress" | "cancelled"
    }[]
}

export function RecentAppointments({ data }: RecentAppointmentsProps) {
    // Function to get badge variant based on status
    const getStatusVariant = (status: string) => {
        switch (status) {
            case "completed":
                return "success"
            case "scheduled":
                return "secondary"
            case "in-progress":
                return "default"
            case "cancelled":
                return "destructive"
            default:
                return "outline"
        }
    }

    // Function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <div className="space-y-4">
            {data.map((appointment) => (
                <div key={appointment.id} className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage
                            src={appointment.customerImage || "/placeholder.svg?height=40&width=40"}
                            alt={appointment.customerName}
                        />
                        <AvatarFallback>{appointment.customerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{appointment.customerName}</p>
                            <Badge variant={getStatusVariant(appointment.status)}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </Badge>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                            <Car className="mr-1 h-3 w-3" />
                            <span className="mr-2">{appointment.vehicle}</span>
                            <Calendar className="mr-1 h-3 w-3" />
                            <span className="mr-2">{formatDate(appointment.date)}</span>
                            <Clock className="mr-1 h-3 w-3" />
                            <span>{appointment.time}</span>
                        </div>
                        <p className="text-sm">{appointment.service}</p>
                    </div>
                </div>
            ))}
            <Button variant="outline" className="w-full" size="sm">
                View All Appointments
            </Button>
        </div>
    )
}

