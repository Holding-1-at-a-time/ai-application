"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useToast } from "sonner/ToastProvider"

interface User {
    id: string
    name: string | null
    email: string
    imageUrl: string | null
    role: "admin" | "business" | "customer"
    businessId?: string
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const { toast } = useToast()

    const { isLoaded: isClerkLoaded, userId, signOut: clerkSignOut } = useClerkAuth()
    const { user: clerkUser, isLoaded: isUserLoaded } = useUser()

    const syncUserWithDatabase = useMutation(api.users.syncUser)

    useEffect(() => {
        const syncUser = async () => {
            if (isClerkLoaded && isUserLoaded) {
                if (userId && clerkUser) {
                    try {
                        // Sync the Clerk user with our database
                        const userData = await syncUserWithDatabase({
                            clerkId: userId,
                            email: clerkUser.primaryEmailAddress?.emailAddress || "",
                            name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
                            imageUrl: clerkUser.imageUrl || null,
                        })

                        setUser({
                            id: userData.id,
                            name: userData.name,
                            email: userData.email,
                            imageUrl: userData.imageUrl,
                            role: userData.role,
                            businessId: userData.businessId,
                        })
                    } catch (error) {
                        console.error("Error syncing user:", error)
                        toast({
                            title: "Error",
                            description: "Failed to sync user data",
                            variant: "destructive",
                        })
                    }
                } else {
                    setUser(null)
                }
                setIsLoading(false)
            }
        }

        syncUser()
    }, [isClerkLoaded, isUserLoaded, userId, clerkUser, syncUserWithDatabase, toast])

    const signOut = async () => {
        try {
            setIsLoading(true)
            await clerkSignOut()
            setUser(null)
            router.push("/")
        } catch (error) {
            console.error("Error signing out:", error)
            toast({
                title: "Error",
                description: "Failed to sign out",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return <AuthContext.Provider value={{ user, isLoading, signOut }}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

