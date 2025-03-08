"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash, Car, Calendar, Clock, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useTenant } from "@/components/tenant-provider"
import { DataPagination } from "@/components/ui/data-pagination"
import type { Id } from "@/convex/_generated/dataModel"

type BookingStatus = "confirmed" | "pending" | "cancelled" | "completed"

// Function to determine status color
const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case "completed":
      return "bg-green-500"
    case "confirmed":
    case "pending":
      return "bg-blue-500"
    case "cancelled":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

// Memoized booking row component
const BookingRow = memo(
  ({
    booking,
    onView,
    onEdit,
    onStatusChange,
    isLoading,
  }: {
    booking: any
    onView: (booking: any) => void
    onEdit: (booking: any) => void
    onStatusChange: (id: Id<"appointments">, status: BookingStatus) => void
    isLoading: boolean
  }) => {
    // Get vehicle info if available
    const vehicle = useMemo(() => {
      if (booking.customer?.vehicles && booking.vehicleIndex !== undefined) {
        return booking.customer.vehicles[booking.vehicleIndex]
      }
      return null
    }, [booking.customer?.vehicles, booking.vehicleIndex])

    // Memoize status color
    const statusColor = useMemo(() => {
      switch (booking.status) {
        case "completed":
          return "bg-green-500"
        case "confirmed":
        case "pending":
          return "bg-blue-500"
        case "cancelled":
          return "bg-red-500"
        default:
          return "bg-gray-500"
      }
    }, [booking.status])

    return (
      <TableRow key={booking._id}>
        <TableCell className="font-medium">{booking._id.substring(0, 8)}</TableCell>
        <TableCell>
          {booking.customer ? (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{booking.customer.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{booking.customer.name}</div>
                <div className="text-sm text-muted-foreground">{booking.customer.email}</div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">Unknown customer</span>
          )}
        </TableCell>
        <TableCell>{booking.service?.name || "Unknown service"}</TableCell>
        <TableCell>
          {vehicle ? (
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">No vehicle specified</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{new Date(booking.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                {booking.startTime} - {booking.endTime}
              </span>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={`${statusColor} text-white`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Badge>
        </TableCell>
        <TableCell>${booking.price.toFixed(2)}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(booking)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(booking)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Booking
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={booking.status === "completed" || booking.status === "cancelled" || isLoading}
                onClick={() => onStatusChange(booking._id, "completed")}
              >
                <Badge variant="outline" className="bg-green-500 text-white mr-2 h-4 px-1">
                  ✓
                </Badge>
                Mark Completed
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={booking.status === "cancelled" || isLoading}
                onClick={() => onStatusChange(booking._id, "cancelled")}
                className="text-destructive"
              >
                <Trash className="mr-2 h-4 w-4" />
                Cancel Booking
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  },
)
BookingRow.displayName = "BookingRow"

export function BookingsTable() {
  const { user } = useAuth()
  const { currentTenantId } = useTenant()
  const { toast } = useToast()

  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [cursor, setCursor] = useState<string | null>(null)

  // Get current date range (this month)
  const dateRange = useMemo(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return {
      startDate: startOfMonth.toISOString().split("T")[0],
      endDate: endOfMonth.toISOString().split("T")[0],
    }
  }, [])

  // Memoize query arguments
  const queryArgs = useMemo(() => {
    if (!currentTenantId) return "skip"

    return {
      businessId: currentTenantId,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      status: statusFilter !== "all" ? (statusFilter as BookingStatus) : "all",
      search: searchTerm,
      cursor,
      limit: pageSize,
    }
  }, [currentTenantId, dateRange.startDate, dateRange.endDate, statusFilter, searchTerm, cursor, pageSize])

  // Fetch bookings from Convex
  const bookingsResult = useQuery(api.appointments.listByBusinessAndDateRangePaginated, queryArgs)

  // Mutations
  const updateBookingStatus = useMutation(api.appointments.update)

  // Update pagination when results change
  useEffect(() => {
    if (bookingsResult?.pagination) {
      setTotalCount(bookingsResult.pagination.totalCount)
    }
  }, [bookingsResult])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
    setCursor(null)
  }, [searchTerm, statusFilter])

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)

      if (page === 1) {
        setCursor(null)
      } else if (bookingsResult?.pagination?.cursor) {
        setCursor(bookingsResult.pagination.cursor)
      }
    },
    [bookingsResult?.pagination?.cursor],
  )

  // Handle page size change
  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    setCursor(null)
  }, [])

  // Memoize event handlers
  const handleViewBooking = useCallback((booking: any) => {
    setSelectedBooking(booking)
    setIsViewDialogOpen(true)
  }, [])

  const handleEditBooking = useCallback((booking: any) => {
    setSelectedBooking(booking)
    setIsEditDialogOpen(true)
  }, [])

  const handleStatusChange = useCallback(
    async (bookingId: Id<"appointments">, newStatus: BookingStatus) => {
      try {
        setIsLoading(true)

        await updateBookingStatus({
          id: bookingId,
          status: newStatus,
        })

        toast({
          title: "Status updated",
          description: `Booking status updated to ${newStatus}`,
        })

        // Close dialogs if open
        if (isViewDialogOpen) setIsViewDialogOpen(false)
        if (isEditDialogOpen) setIsEditDialogOpen(false)
      } catch (error) {
        console.error("Error updating booking status:", error)
        toast({
          title: "Error updating status",
          description: "There was a problem updating the booking status. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [updateBookingStatus, toast, isViewDialogOpen, isEditDialogOpen],
  )

  // Memoize filtered bookings
  const bookings = useMemo(() => {
    return bookingsResult?.bookings || []
  }, [bookingsResult])

  if (!currentTenantId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40 py-10">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You need to be associated with a business to manage bookings.</p>
            <Button disabled>Create Business</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (bookingsResult === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle>Bookings</CardTitle>
              <CardDescription>View and manage your bookings and appointments</CardDescription>
            </div>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sm:w-[250px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No bookings found for the selected criteria.</p>
              <Button>Create New Booking</Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <BookingRow
                        key={booking._id}
                        booking={booking}
                        onView={handleViewBooking}
                        onEdit={handleEditBooking}
                        onStatusChange={handleStatusChange}
                        isLoading={isLoading}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4">
                <DataPagination
                  totalCount={totalCount}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* View Booking Dialog */}
      {selectedBooking && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>Booking ID: {selectedBooking._id.substring(0, 8)}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{selectedBooking.customer?.name.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <span>{selectedBooking.customer?.name || "Unknown customer"}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {selectedBooking.customer?.email || "No email available"}
                  </div>
                  {selectedBooking.customer?.phone && (
                    <div className="text-sm text-muted-foreground">{selectedBooking.customer.phone}</div>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium">Vehicle</Label>
                  {selectedBooking.customer?.vehicles && selectedBooking.vehicleIndex !== undefined ? (
                    <>
                      <div className="flex items-center gap-2 mt-1">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedBooking.customer.vehicles[selectedBooking.vehicleIndex].year}{" "}
                          {selectedBooking.customer.vehicles[selectedBooking.vehicleIndex].make}{" "}
                          {selectedBooking.customer.vehicles[selectedBooking.vehicleIndex].model}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Color: {selectedBooking.customer.vehicles[selectedBooking.vehicleIndex].color}
                      </div>
                      {selectedBooking.customer.vehicles[selectedBooking.vehicleIndex].licensePlate && (
                        <div className="text-sm text-muted-foreground">
                          License: {selectedBooking.customer.vehicles[selectedBooking.vehicleIndex].licensePlate}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground mt-1">No vehicle specified</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Service</Label>
                  <div className="mt-1">{selectedBooking.service?.name || "Unknown service"}</div>
                  <div className="text-sm text-muted-foreground mt-1">Amount: ${selectedBooking.price.toFixed(2)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date & Time</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(selectedBooking.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {selectedBooking.startTime} - {selectedBooking.endTime}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <div className="mt-1">
                  <Badge variant="outline" className={`${getStatusColor(selectedBooking.status)} text-white`}>
                    {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                  </Badge>
                </div>
              </div>
              {selectedBooking.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <div className="mt-1 text-sm">{selectedBooking.notes}</div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  handleEditBooking(selectedBooking)
                }}
              >
                Edit Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Booking Dialog */}
      {selectedBooking && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
              <DialogDescription>Make changes to booking {selectedBooking._id.substring(0, 8)}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" defaultValue={selectedBooking.date} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" type="time" defaultValue={selectedBooking.startTime} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" type="time" defaultValue={selectedBooking.endTime} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue={selectedBooking.status}
                  onValueChange={(value) => handleStatusChange(selectedBooking._id, value as BookingStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  defaultValue={selectedBooking.notes || ""}
                  placeholder="Add any additional notes about this booking"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // In a real implementation, we would call the update mutation here
                  setIsEditDialogOpen(false)
                  toast({
                    title: "Booking updated",
                    description: "The booking has been updated successfully.",
                  })
                }}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

