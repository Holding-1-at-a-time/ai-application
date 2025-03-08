"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react"

type BookingStatus = "completed" | "upcoming" | "cancelled" | "in-progress"

interface Booking {
  id: string
  customer: {
    name: string
    email: string
    avatar?: string
  }
  service: string
  date: string
  time: string
  status: BookingStatus
  amount: number
}

const bookings: Booking[] = [
  {
    id: "B001",
    customer: {
      name: "John Smith",
      email: "john@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    service: "Premium Detail",
    date: "2023-11-05",
    time: "10:00 AM",
    status: "completed",
    amount: 249.99,
  },
  {
    id: "B002",
    customer: {
      name: "Sarah Johnson",
      email: "sarah@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    service: "Basic Wash",
    date: "2023-11-06",
    time: "2:30 PM",
    status: "upcoming",
    amount: 89.99,
  },
  {
    id: "B003",
    customer: {
      name: "Michael Chen",
      email: "michael@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    service: "Interior Detail",
    date: "2023-11-04",
    time: "1:00 PM",
    status: "completed",
    amount: 149.99,
  },
  {
    id: "B004",
    customer: {
      name: "Emily Davis",
      email: "emily@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    service: "Full Detail",
    date: "2023-11-07",
    time: "11:30 AM",
    status: "upcoming",
    amount: 199.99,
  },
  {
    id: "B005",
    customer: {
      name: "Robert Wilson",
      email: "robert@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
    },
    service: "Premium Detail",
    date: "2023-11-03",
    time: "9:00 AM",
    status: "cancelled",
    amount: 249.99,
  },
]

export function RecentBookings() {
  const [bookingsList, setBookingsList] = useState<Booking[]>(bookings)

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "upcoming":
        return "bg-blue-500"
      case "cancelled":
        return "bg-red-500"
      case "in-progress":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
        <CardDescription>View and manage your recent bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookingsList.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={booking.customer.avatar} alt={booking.customer.name} />
                      <AvatarFallback>{booking.customer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{booking.customer.name}</div>
                      <div className="text-sm text-muted-foreground">{booking.customer.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{booking.service}</TableCell>
                <TableCell>
                  <div>{new Date(booking.date).toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">{booking.time}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getStatusColor(booking.status)} text-white`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>${booking.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Booking
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Cancel Booking
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

