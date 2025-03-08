"use client"

import { useState, memo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash, Car, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/hooks/use-auth"
import { useTenant } from "@/components/tenant-provider"
import { useMutation, useQuery } from "convex/react"
import { AvatarOptimized } from "@/components/ui/avatar-optimized"
import { DataPagination } from "@/components/ui/data-pagination"
import { useToast } from "@/components/ui/use-toast"
import { LoadingState } from "@/components/ui/loading-state"
import type { Id } from "@/convex/_generated/dataModel"

interface Vehicle {
  make: string
  model: string
  year: number
  color: string
  licensePlate?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  vehicles?: Vehicle[]
  totalBookings: number
  totalSpent: number
  lastVisit?: string
  avatar?: string
}

// Memoized vehicle badge component
const VehicleBadge = memo(({ vehicle, index }: { vehicle: Vehicle; index: number }) => (
  <Badge key={index} variant="outline" className="flex items-center gap-1 w-fit">
    <Car className="h-3 w-3" />
    <span>
      {vehicle.year} {vehicle.make} {vehicle.model}
    </span>
  </Badge>
))
VehicleBadge.displayName = "VehicleBadge"

// Memoized customer row component
const CustomerRow = memo(
  ({
    customer,
    onView,
    onEdit,
    onDelete,
  }: {
    customer: Customer
    onView: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
  }) => {
    return (
      <TableRow key={customer.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <AvatarOptimized src={customer.avatar} alt={customer.name} fallback={customer.name.charAt(0)} size={32} />
            <div>
              <div className="font-medium">{customer.name}</div>
              <div className="text-sm text-muted-foreground">{customer.id}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div className="text-sm">{customer.email}</div>
            <div className="text-sm text-muted-foreground">{customer.phone}</div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-1">
            {customer.vehicles?.map((vehicle, index) => (
              <VehicleBadge key={index} vehicle={vehicle} index={index} />
            ))}
          </div>
        </TableCell>
        <TableCell>{customer.totalBookings}</TableCell>
        <TableCell>${customer.totalSpent.toFixed(2)}</TableCell>
        <TableCell>{customer.lastVisit ? new Date(customer.lastVisit).toLocaleDateString() : "N/A"}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(customer.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(customer.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Customer
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Car className="mr-2 h-4 w-4" />
                Add Vehicle
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(customer.id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete Customer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  },
)
CustomerRow.displayName = "CustomerRow"

export function CustomersTable() {
  const { user } = useAuth()
  const { currentTenantId } = useTenant()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Pagination state
  const [cursor, setCursor] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  // Use Convex query with pagination
  const customersResult = useQuery(
    api.customers.listByBusinessPaginated,
    currentTenantId
      ? {
          businessId: currentTenantId,
          search: searchTerm,
          cursor,
          limit: pageSize,
        }
      : "skip",
  )

  const deleteCustomer = useMutation(api.customers.remove)

  // Update cursor when page changes
  useEffect(() => {
    if (customersResult?.pagination?.cursor) {
      setCursor(customersResult.pagination.cursor)
    }

    if (customersResult?.pagination?.totalCount) {
      setTotalCount(customersResult.pagination.totalCount)
    }
  }, [customersResult])

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1)
    setCursor(null)
  }, [searchTerm])

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    // Calculate the cursor based on the page number
    if (page === 1) {
      setCursor(null)
    } else if (customersResult?.pagination?.cursor) {
      setCursor(customersResult.pagination.cursor)
    }
  }

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(1)
    setCursor(null)
  }

  // Handle view customer
  const handleViewCustomer = (id: string) => {
    // Implement view logic
    console.log("View customer", id)
  }

  // Handle edit customer
  const handleEditCustomer = (id: string) => {
    // Implement edit logic
    console.log("Edit customer", id)
  }

  // Handle delete customer
  const handleDeleteCustomer = async (id: string) => {
    try {
      setIsDeleting(id)
      await deleteCustomer({ id: id as Id<"customers"> })
      toast({
        title: "Customer deleted",
        description: "The customer has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: "There was a problem deleting the customer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  if (!currentTenantId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40 py-10">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You need to be associated with a business to manage customers.</p>
            <Button disabled>Create Business</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (customersResult === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40 py-10">
          <LoadingState text="Loading customers..." />
        </CardContent>
      </Card>
    )
  }

  const customers = customersResult.customers || []

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Customer Database</CardTitle>
            <CardDescription>View and manage your customer information</CardDescription>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sm:w-[300px]"
            />
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "No customers match your search." : "You haven't added any customers yet."}
            </p>
            {!searchTerm && <Button>Add Your First Customer</Button>}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Vehicles</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Visit</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <CustomerRow
                      key={customer.id}
                      customer={customer}
                      onView={handleViewCustomer}
                      onEdit={handleEditCustomer}
                      onDelete={handleDeleteCustomer}
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
  )
}

