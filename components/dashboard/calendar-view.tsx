"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Appointment {
  id: string
  title: string
  customer: string
  service: string
  date: Date
  startTime: string
  endTime: string
  status: "confirmed" | "pending" | "cancelled"
}

// Sample data
const appointments: Appointment[] = [
  {
    id: "1",
    title: "Premium Detail - John Smith",
    customer: "John Smith",
    service: "Premium Detail",
    date: new Date(2023, 10, 5),
    startTime: "10:00",
    endTime: "13:00",
    status: "confirmed",
  },
  {
    id: "2",
    title: "Basic Wash - Sarah Johnson",
    customer: "Sarah Johnson",
    service: "Basic Wash",
    date: new Date(2023, 10, 6),
    startTime: "14:30",
    endTime: "15:30",
    status: "confirmed",
  },
  {
    id: "3",
    title: "Interior Detail - Michael Chen",
    customer: "Michael Chen",
    service: "Interior Detail",
    date: new Date(2023, 10, 4),
    startTime: "13:00",
    endTime: "15:00",
    status: "confirmed",
  },
  {
    id: "4",
    title: "Full Detail - Emily Davis",
    customer: "Emily Davis",
    service: "Full Detail",
    date: new Date(2023, 10, 7),
    startTime: "11:30",
    endTime: "14:30",
    status: "pending",
  },
  {
    id: "5",
    title: "Premium Detail - Robert Wilson",
    customer: "Robert Wilson",
    service: "Premium Detail",
    date: new Date(2023, 10, 3),
    startTime: "09:00",
    endTime: "12:00",
    status: "cancelled",
  },
]

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false)

  // Function to check if a date has appointments
  const hasAppointment = (day: Date) => {
    return appointments.some(
      (appointment) =>
        appointment.date.getDate() === day.getDate() &&
        appointment.date.getMonth() === day.getMonth() &&
        appointment.date.getFullYear() === day.getFullYear(),
    )
  }

  // Function to get appointments for a specific date
  const getAppointmentsForDate = (day: Date) => {
    return appointments.filter(
      (appointment) =>
        appointment.date.getDate() === day.getDate() &&
        appointment.date.getMonth() === day.getMonth() &&
        appointment.date.getFullYear() === day.getFullYear(),
    )
  }

  // Function to handle day click
  const handleDayClick = (day: Date | undefined) => {
    if (day) {
      setDate(day)
    }
  }

  // Function to handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Calendar</h2>
        <Button onClick={() => setIsNewAppointmentDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-4">
        <Card>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDayClick}
              className="rounded-md border"
              modifiers={{
                hasAppointment: (day) => hasAppointment(day),
              }}
              modifiersStyles={{
                hasAppointment: {
                  fontWeight: "bold",
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {date
                ? date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                : "Select a date"}
            </CardTitle>
            <CardDescription>
              {date ? `${getAppointmentsForDate(date).length} appointments scheduled` : "No date selected"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {date && getAppointmentsForDate(date).length > 0 ? (
              <div className="space-y-4">
                {getAppointmentsForDate(date).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="space-y-1">
                        <p className="font-medium">{appointment.title}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span>
                            {appointment.startTime} - {appointment.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        appointment.status === "confirmed"
                          ? "default"
                          : appointment.status === "pending"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-muted-foreground">No appointments scheduled for this date</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsNewAppointmentDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <p className="text-sm">{selectedAppointment.customer}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Service</Label>
                  <p className="text-sm">{selectedAppointment.service}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">{selectedAppointment.date.toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Time</Label>
                  <p className="text-sm">
                    {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge
                    variant={
                      selectedAppointment.status === "confirmed"
                        ? "default"
                        : selectedAppointment.status === "pending"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button>Edit Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Appointment Dialog */}
      <Dialog open={isNewAppointmentDialogOpen} onOpenChange={setIsNewAppointmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>Create a new appointment for your calendar.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john-smith">John Smith</SelectItem>
                  <SelectItem value="sarah-johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="michael-chen">Michael Chen</SelectItem>
                  <SelectItem value="emily-davis">Emily Davis</SelectItem>
                  <SelectItem value="robert-wilson">Robert Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic-wash">Basic Wash ($89.99)</SelectItem>
                  <SelectItem value="interior-detail">Interior Detail ($149.99)</SelectItem>
                  <SelectItem value="exterior-detail">Exterior Detail ($149.99)</SelectItem>
                  <SelectItem value="full-detail">Full Detail ($199.99)</SelectItem>
                  <SelectItem value="premium-detail">Premium Detail ($249.99)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" value={date ? date.toISOString().split("T")[0] : ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Start Time</Label>
                <Input id="time" type="time" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select defaultValue="60">
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Add any additional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewAppointmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button>Create Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

