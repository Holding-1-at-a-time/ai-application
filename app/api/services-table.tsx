"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { useTenant } from "@/components/tenant-provider"
import type { Id } from "@/convex/_generated/dataModel"

// Memoized table row component to prevent unnecessary re-renders
const ServiceTableRow = memo(
  ({
    service,
    onToggleStatus,
    onDelete,
    onEdit,
    isLoading,
    isUpdating,
  }: {
    service: any
    onToggleStatus: (id: Id<"services">, active: boolean) => void
    onDelete: (id: Id<"services">) => void
    onEdit: (id: Id<"services">) => void
    isLoading: boolean
    isUpdating: boolean
  }) => {
    // Format duration once and memoize it
    const formattedDuration = useMemo(() => {
      const hours = Math.floor(service.duration / 60)
      const mins = service.duration % 60
      return `${hours > 0 ? `${hours}h ` : ""}${mins > 0 ? `${mins}m` : ""}`
    }, [service.duration])

    return (
      <TableRow key={service._id}>
        <TableCell className="font-medium">{service.name}</TableCell>
        <TableCell className="max-w-xs truncate">{service.description}</TableCell>
        <TableCell>${service.price.toFixed(2)}</TableCell>
        <TableCell>{formattedDuration}</TableCell>
        <TableCell>
          <Badge variant="outline">{service.category || "General"}</Badge>
        </TableCell>
        <TableCell>
          <Switch
            checked={service.active}
            onCheckedChange={() => onToggleStatus(service._id, service.active)}
            disabled={isLoading || isUpdating}
            aria-label={service.active ? "Deactivate service" : "Activate service"}
          />
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(service._id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Service
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(service._id)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete Service
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    )
  },
)
ServiceTableRow.displayName = "ServiceTableRow"

export function ServicesTable() {
  const { user } = useAuth()
  const { currentTenantId } = useTenant()
  const { toast } = useToast()

  // State
  const [isLoading, setIsLoading] = useState(false)
  const [updatingServices, setUpdatingServices] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Memoize query arguments to prevent unnecessary re-fetches
  const queryArgs = useMemo(() => {
    if (!currentTenantId) return "skip"
    return {
      businessId: currentTenantId,
      includeInactive: true,
      search: searchTerm,
      cursor: null,
      limit: pageSize,
    }
  }, [currentTenantId, searchTerm, pageSize])

  // Fetch services from Convex
  const services = useQuery(api.services.listByBusiness, queryArgs)

  // Mutations
  const updateService = useMutation(api.services.update)
  const deleteService = useMutation(api.services.remove)

  // Memoize filtered services to prevent unnecessary re-renders
  const filteredServices = useMemo(() => {
    if (!services) return []

    if (!searchTerm) return services

    const search = searchTerm.toLowerCase()
    return services.filter(
      (service) =>
        service.name.toLowerCase().includes(search) ||
        service.description.toLowerCase().includes(search) ||
        (service.category && service.category.toLowerCase().includes(search)),
    )
  }, [services, searchTerm])

  // Handle errors if services query fails
  useEffect(() => {
    if (services === undefined && currentTenantId) {
      toast({
        title: "Error loading services",
        description: "There was a problem loading your services. Please try again.",
        variant: "destructive",
      })
    }
  }, [services, currentTenantId, toast])

  // Memoize event handlers to prevent unnecessary re-renders
  const toggleServiceStatus = useCallback(
    async (id: Id<"services">, currentStatus: boolean) => {
      try {
        // Add service to updating set
        setUpdatingServices((prev) => new Set(prev).add(id.toString()))

        await updateService({ id, active: !currentStatus })

        toast({
          title: `Service ${!currentStatus ? "activated" : "deactivated"}`,
          description: `The service has been ${!currentStatus ? "activated" : "deactivated"} successfully.`,
        })
      } catch (error) {
        console.error("Error toggling service status:", error)
        toast({
          title: "Error updating service",
          description: "There was a problem updating the service status. Please try again.",
          variant: "destructive",
        })
      } finally {
        // Remove service from updating set
        setUpdatingServices((prev) => {
          const newSet = new Set(prev)
          newSet.delete(id.toString())
          return newSet
        })
      }
    },
    [updateService, toast],
  )

  const handleDeleteService = useCallback(
    async (id: Id<"services">) => {
      try {
        setIsLoading(true)

        const result = await deleteService({ id })

        if (result.deactivated) {
          toast({
            title: "Service deactivated",
            description: "The service has appointments and was deactivated instead of deleted.",
          })
        } else {
          toast({
            title: "Service deleted",
            description: "The service has been deleted successfully.",
          })
        }
      } catch (error) {
        console.error("Error deleting service:", error)
        toast({
          title: "Error deleting service",
          description: "There was a problem deleting the service. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [deleteService, toast],
  )

  const handleEditService = useCallback((id: Id<"services">) => {
    // Implement edit functionality
    console.log("Edit service", id)
  }, [])

  if (!currentTenantId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40 py-10">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">You need to be associated with a business to manage services.</p>
            <Button disabled>Create Business</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (services === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-40 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailing Services</CardTitle>
        <CardDescription>View and manage your service offerings</CardDescription>
      </CardHeader>
      <CardContent>
        {filteredServices.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground mb-4">You haven't added any services yet.</p>
            <Button>Add Your First Service</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <ServiceTableRow
                  key={service._id}
                  service={service}
                  onToggleStatus={toggleServiceStatus}
                  onDelete={handleDeleteService}
                  onEdit={handleEditService}
                  isLoading={isLoading}
                  isUpdating={updatingServices.has(service._id.toString())}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

