"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter, usePathname } from "next/navigation"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { LoadingState } from "@/components/ui/loading-state"

interface TenantContextType {
    currentTenantId: Id<"businesses"> | null
    currentTenant: any | null
    isLoading: boolean
    switchTenant: (tenantId: Id<"businesses">) => void
    userHasAccessToTenant: (tenantId: Id<"businesses">) => boolean
    availableTenants: any[]
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

export function TenantProvider({ children }: { children: ReactNode }) {
    const { user, isLoading: isAuthLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const [currentTenantId, setCurrentTenantId] = useState<Id<"businesses"> | null>(null)
    const [availableTenants, setAvailableTenants] = useState<any[]>([])

    // Fetch user's available tenants
    const userTenants = useQuery(api.businesses.listTenantsForUser, user ? { userId: user.id as Id<"users"> } : "skip")

    // Fetch current tenant details
    const currentTenant = useQuery(api.businesses.getById, currentTenantId ? { id: currentTenantId } : "skip")

    // Initialize tenant when user data is available
    useEffect(() => {
        if (!isAuthLoading && user && userTenants) {
            setAvailableTenants(userTenants)

            // If user has a businessId, use that as the current tenant
            if (user.businessId) {
                setCurrentTenantId(user.businessId as Id<"businesses">)
            }
            // Otherwise use the first available tenant if any
            else if (userTenants.length > 0) {
                setCurrentTenantId(userTenants[0]._id)
            }
        }
    }, [isAuthLoading, user, userTenants])

    // Check if user has access to a specific tenant
    const userHasAccessToTenant = (tenantId: Id<"businesses">) => {
        if (!user) return false

        // Admin users have access to all tenants
        if (user.role === "admin") return true

        // Business owners have access to their own business
        if (user.businessId === tenantId) return true

        // Check if user is a member of this tenant
        return availableTenants.some((tenant) => tenant._id === tenantId)
    }

    // Switch to a different tenant
    const switchTenant = (tenantId: Id<"businesses">) => {
        if (userHasAccessToTenant(tenantId)) {
            setCurrentTenantId(tenantId)

            // Redirect to dashboard of the new tenant
            if (pathname.includes("/dashboard")) {
                router.push("/dashboard")
            }
        }
    }

    const isLoading = isAuthLoading || (user && !userTenants)

    return (
        <TenantContext.Provider
            value={{
                currentTenantId,
                currentTenant,
                isLoading,
                switchTenant,
                userHasAccessToTenant,
                availableTenants,
            }}
        >
            {isLoading ? (
                <div className="flex items-center justify-center min-h-screen">
                    <LoadingState text="Loading tenant data..." />
                </div>
            ) : (
                children
            )}
        </TenantContext.Provider>
    )
}

export function useTenant() {
    const context = useContext(TenantContext)
    if (context === undefined) {
        throw new Error("useTenant must be used within a TenantProvider")
    }
    return context
}

