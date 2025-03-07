import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, BarChart } from "lucide-react"

interface BookingPatternsProps {
    appointments: any[]
}

export default function BookingPatterns({ appointments }: BookingPatternsProps) {
    // Process appointment data to extract booking patterns

    // 1. Bookings by day of week
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const bookingsByDay = Array(7).fill(0)

    // 2. Bookings by time of day
    const timeSlots = [
        { name: "Morning (6-10)", count: 0 },
        { name: "Mid-day (10-14)", count: 0 },
        { name: "Afternoon (14-18)", count: 0 },
        { name: "Evening (18-22)", count: 0 },
    ]

    // 3. Bookings by month
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const bookingsByMonth = Array(12).fill(0)

    // 4. Cancellation rates by day
    const cancellationsByDay = Array(7).fill(0)
    const totalByDay = Array(7).fill(0)

    // Process appointments
    appointments.forEach((appointment) => {
        const date = new Date(appointment.date)
        const dayOfWeek = date.getDay()
        const month = date.getMonth()

        // Extract hour from time string (HH:MM)
        const hour = Number.parseInt(appointment.time.split(":")[0])

        // Count by day of week
        bookingsByDay[dayOfWeek]++

        // Count by time of day
        if (hour >= 6 && hour < 10) timeSlots[0].count++
        else if (hour >= 10 && hour < 14) timeSlots[1].count++
        else if (hour >= 14 && hour < 18) timeSlots[2].count++
        else if (hour >= 18 && hour < 22) timeSlots[3].count++

        // Count by month
        bookingsByMonth[month]++

        // Track cancellations by day
        totalByDay[dayOfWeek]++
        if (appointment.status === "cancelled") {
            cancellationsByDay[dayOfWeek]++
        }
    })

    // Calculate cancellation rates
    const cancellationRates = totalByDay.map((total, index) =>
        total > 0 ? (cancellationsByDay[index] / total) * 100 : 0,
    )

    // Find peak booking day
    const peakDayIndex = bookingsByDay.indexOf(Math.max(...bookingsByDay))

    // Find peak time slot
    const peakTimeSlot = timeSlots.reduce((max, slot) => (slot.count > max.count ? slot : max), timeSlots[0])

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="bg-primary/5 p-4 rounded-lg">
                <h3 className="text-lg font-semibold flex items-center mb-2">
                    <Calendar className="mr-2 h-4 w-4 text-primary" />
                    Booking Pattern Summary
                </h3>
                <p className="text-sm text-muted-foreground">Analysis based on {appointments.length} appointments.</p>
            </div>

            {/* Bookings by Day of Week */}
            <div>
                <h3 className="text-lg font-semibold mb-3">Bookings by Day of Week</h3>
                <div className="h-64 relative">
                    <div className="absolute inset-0 flex items-end">
                        {bookingsByDay.map((count, index) => {
                            // Calculate max count for scaling
                            const maxCount = Math.max(...bookingsByDay)
                            const height = maxCount > 0 ? (count / maxCount) * 100 : 0

                            return (
                                <div key={index} className="flex-1 flex flex-col items-center">
                                    <div
                                        className={`w-full mx-1 rounded-t ${index === peakDayIndex ? "bg-primary" : "bg-primary/60"}`}
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="w-full h-full relative group">
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 mb-1 transition-opacity">
                                                {count} bookings
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs mt-1 text-muted-foreground">{dayNames[index].substring(0, 3)}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Bookings by Time of Day */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            Bookings by Time of Day
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {timeSlots.map((slot, index) => {
                                // Calculate percentage for width
                                const totalBookings = timeSlots.reduce((sum, s) => sum + s.count, 0)
                                const percentage = totalBookings > 0 ? (slot.count / totalBookings) * 100 : 0

                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">{slot.name}</span>
                                            <span className="text-sm font-medium">{slot.count} bookings</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${slot === peakTimeSlot ? "bg-primary" : "bg-primary/60"}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Cancellation Rates by Day */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center">
                            <BarChart className="mr-2 h-4 w-4 text-primary" />
                            Cancellation Rates by Day
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {dayNames.map((day, index) => {
                                return (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm">{day}</span>
                                            <Badge variant={getCancellationRateVariant(cancellationRates[index])}>
                                                {cancellationRates[index].toFixed(1)}%
                                            </Badge>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${getCancellationRateColor(cancellationRates[index])}`}
                                                style={{ width: `${cancellationRates[index]}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Key Insights */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Booking Pattern Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start">
                            <div className="bg-primary/20 p-2 rounded-full mr-3">
                                <Calendar className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Peak Booking Day</h4>
                                <p className="text-sm text-muted-foreground">
                                    {dayNames[peakDayIndex]} is your busiest day with {bookingsByDay[peakDayIndex]} bookings.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-primary/20 p-2 rounded-full mr-3">
                                <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Peak Booking Time</h4>
                                <p className="text-sm text-muted-foreground">
                                    {peakTimeSlot.name} is your most popular time slot with {peakTimeSlot.count} bookings.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-primary/20 p-2 rounded-full mr-3">
                                <BarChart className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <h4 className="font-medium">Highest Cancellation Rate</h4>
                                <p className="text-sm text-muted-foreground">
                                    {dayNames[cancellationRates.indexOf(Math.max(...cancellationRates))]} has the highest cancellation
                                    rate at {Math.max(...cancellationRates).toFixed(1)}%.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// Helper functions for styling
function getCancellationRateVariant(rate: number) {
    if (rate < 5) return "default"
    if (rate < 15) return "secondary"
    if (rate < 25) return "outline"
    return "destructive"
}

function getCancellationRateColor(rate: number) {
    if (rate < 5) return "bg-green-500"
    if (rate < 15) return "bg-yellow-500"
    if (rate < 25) return "bg-orange-500"
    return "bg-red-500"
}

