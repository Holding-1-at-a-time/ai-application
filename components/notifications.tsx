"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BellRing, Check, MessageSquare, TrendingUp, Calendar, DollarSign, AlertTriangle } from "lucide-react"

export default function Notifications() {
    const [open, setOpen] = useState(false)

    // Get notifications
    const notifications = useQuery(api.alerts.getUserNotifications, {
        unreadOnly: false,
        limit: 10,
    })

    // Mark notification as read
    const markRead = useMutation(api.alerts.markNotificationRead)

    // Mark all notifications as read
    const markAllRead = useMutation(api.alerts.markAllNotificationsRead)

    // Count unread notifications
    const unreadCount = notifications?.filter((n) => !n.isRead).length || 0

    // Handle marking a notification as read
    const handleMarkRead = async (notificationId: string) => {
        try {
            await markRead({
                notificationId,
            })
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    // Handle marking all notifications as read
    const handleMarkAllRead = async () => {
        try {
            await markAllRead({})
            setOpen(false)
        } catch (error) {
            console.error("Error marking all notifications as read:", error)
        }
    }

    // Get notification icon based on type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "sentiment":
                return <MessageSquare className="h-4 w-4 text-yellow-500" />
            case "pattern":
                return <TrendingUp className="h-4 w-4 text-blue-500" />
            case "booking":
                return <Calendar className="h-4 w-4 text-purple-500" />
            case "revenue":
                return <DollarSign className="h-4 w-4 text-green-500" />
            case "quality":
                return <AlertTriangle className="h-4 w-4 text-orange-500" />
            default:
                return <BellRing className="h-4 w-4 text-gray-500" />
        }
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / (1000 * 60))
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffMins < 60) {
            return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
        } else if (diffHours < 24) {
            return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
        } else if (diffDays < 7) {
            return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
        } else {
            return new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
            }).format(date)
        }
    }

    // Mark notification as read when clicked
    const handleNotificationClick = (notificationId: string) => {
        handleMarkRead(notificationId)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <BellRing className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center translate-x-1/4 -translate-y-1/4">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4">
                    <h4 className="font-medium">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                            <Check className="mr-2 h-4 w-4" />
                            Mark all read
                        </Button>
                    )}
                </div>
                <Separator />
                <ScrollArea className="h-[300px]">
                    {!notifications || notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <BellRing className="h-10 w-10 text-muted-foreground/40 mb-2" />
                            <p className="text-sm text-muted-foreground">No notifications</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 hover:bg-muted/50 cursor-pointer ${!notification.isRead ? "bg-muted/20" : ""}`}
                                    onClick={() => handleNotificationClick(notification._id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm ${!notification.isRead ? "font-medium" : ""}`}>{notification.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</p>
                                        </div>
                                        {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}

