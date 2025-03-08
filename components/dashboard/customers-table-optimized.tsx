"use client"

import { useEffect } from "react"

import { useState, useMemo, memo, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash, Car, Loader2, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/hooks/use-auth"
import { useTenant } from "@/components/tenant-provider"
import { AvatarOptimized } from "@/components/ui/avatar-optimized"
import { DataPagination } from "@/components/ui/data-pagination"
import { useSWRQuery } from "@/hooks/use-swr-query"
import { useOptimisticMutation } from "@/hooks/use-optimistic-mutation"
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
    isDeleting,
  }: {
    customer: Customer
    onView: (id: string) => void
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    isDeleting: boolean
  }) => {
    const isBeingDeleted = isDeleting === customer.id

    return (
      <TableRow key={customer.id} className={isBeingDeleted ? "opacity-50" : ""}>
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
              <Button variant="ghost" size="icon" disabled={isBeingDeleted}>
                {isBeingDeleted ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
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
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(customer.id)}
                disabled={isBeingDeleted}
              >
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

export function CustomersTableOptimized() {
  const { user } = useAuth()
  const { currentTenantId } = useTenant()

  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Memoize query arguments
  const queryArgs = useMemo(() => {
    if (!currentTenantId) return "skip"

    return {
      businessId: currentTenantId,
      search: debouncedSearchTerm,
      cursor: null,
      limit: pageSize,
    }
  }, [currentTenantId, debouncedSearchTerm, pageSize])

  // Use SWR for data fetching
  const {
    data: customersResult,
    isLoading,
    error,
    mutate,
  } = useSWRQuery(api.customers.listByBusinessPaginated, queryArgs, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  // Use optimistic mutation for delete
  const { execute: executeDelete, isLoading: isDeleteLoading } = useOptimisticMutation(
    api.customers.remove,
    api.customers.listByBusinessPaginated,
    queryArgs,
    {
      successMessage: "Customer deleted successfully",
      errorMessage: "Failed to delete customer",
      optimisticUpdate: (currentData, args) => {
        if (!currentData) return currentData

        // Filter out the deleted customer
        return {
          ...currentData,
          customers: currentData.customers.filter((customer) => customer.id !== args.id),
        }
      },
    },
  )

  // Memoize customers data
  const customers = useMemo(() => {
    return customersResult?.customers || []
  }, [customersResult])

  // Memoize total count
  const totalCount = useMemo(() => {
    return customersResult?.pagination?.totalCount || 0
  }, [customersResult])

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)

      // Update query args with new cursor
      if (page === 1) {
        mutate({
          ...customersResult,
          cursor: null,
        })
      } else if (customersResult?.pagination?.cursor) {
        mutate({
          ...customersResult,
          cursor: customersResult.pagination.cursor,
        })
      }
    },
    [customersResult, mutate],
  )

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (size: number) => {
      setPageSize(size)
      setCurrentPage(1)

      // Update query args with new page size and reset cursor
      mutate({
        ...customersResult,
        cursor: null,
        limit: size,
      })
    },
    [customersResult, mutate],
  )

  // Handle view customer
  const handleViewCustomer = useCallback((id: string) => {
    // Implement view logic
    console.log("View customer", id)
  }, [])

  // Handle edit customer
  const handleEditCustomer = useCallback((id: string) => {
    // Implement edit logic
    console.log("Edit customer", id)
  }, [])

  // Handle delete customer
  const handleDeleteCustomer = useCallback(
    async (id: string) => {
      setIsDeleting(id)
      try {
        await executeDelete({ id: id as Id<"customers"> })
      } finally {
        setIsDeleting(null)
      }
    },
    [executeDelete],
  )

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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40 py-10">
          <LoadingState text="Loading customers..." />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40 py-10">
          <div className="text-center">
            <p className="text-destructive mb-4">Failed to load customers.</p>
            <Button onClick={() => mutate()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>Customer Database</CardTitle>
            <CardDescription>View and manage your customer information</CardDescription>
          </div>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:w-[300px]"
              />
            </div>
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
              {debouncedSearchTerm ? "No customers match your search." : "You haven't added any customers yet."}
            </p>
            {!debouncedSearchTerm && <Button>Add Your First Customer</Button>}
          </div>
        ) : (
          <>
            <div className="rounded-md border overflow-hidden">
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
                      isDeleting={isDeleting === customer.id}
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

