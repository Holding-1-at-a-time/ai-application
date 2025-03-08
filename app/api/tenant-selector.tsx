"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTenant } from "@/components/tenant-provider"
import { useRouter } from "next/navigation"
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
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "@/components/ui/use-toast"
import { LoadingState } from "@/components/ui/loading-state"

export function TenantSelector() {
  const { currentTenantId, currentTenant, availableTenants, switchTenant } = useTenant()
  const [open, setOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Form state
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Mutations
  const createTenant = useMutation(api.businesses.createTenant)

  // Handle tenant creation
  const handleCreateTenant = async () => {
    if (!name || !slug) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsCreating(true)

      const result = await createTenant({
        name,
        slug: slug
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      })

      toast({
        title: "Business created",
        description: "Your new business has been created successfully",
      })

      setCreateDialogOpen(false)
      setName("")
      setSlug("")

      // Switch to the new tenant
      if (result?.businessId) {
        switchTenant(result.businessId)
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error creating tenant:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create business",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)
    setSlug(
      value
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    )
  }

  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a business"
            className="w-[200px] justify-between"
          >
            {currentTenant ? currentTenant.name : "Select business"}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search business..." />
              <CommandEmpty>No business found.</CommandEmpty>
              <CommandGroup heading="Your Businesses">
                {availableTenants.map((tenant) => (
                  <CommandItem
                    key={tenant._id}
                    value={tenant._id}
                    onSelect={() => {
                      switchTenant(tenant._id)
                      setOpen(false)
                    }}
                    className="text-sm"
                  >
                    <Check
                      className={cn("mr-2 h-4 w-4", currentTenantId === tenant._id ? "opacity-100" : "opacity-0")}
                    />
                    {tenant.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    setCreateDialogOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Business
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Business</DialogTitle>
            <DialogDescription>
              Add a new business to your account. This will create a new tenant in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Acme Detailing"
                disabled={isCreating}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">
                Business URL
                <span className="text-muted-foreground ml-1 text-xs">(letters, numbers, hyphens only)</span>
              </Label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">autodetailpro.com/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  placeholder="acme-detailing"
                  className="flex-1"
                  disabled={isCreating}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateTenant} disabled={isCreating || !name || !slug}>
              {isCreating ? (
                <>
                  <LoadingState size="sm" text="" className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Business"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

