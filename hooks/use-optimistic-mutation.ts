"use client"

import { useState, useCallback } from "react"
import { useMutation } from "convex/react"
import { useToast } from "@/components/ui/use-toast"
import { useSWRQuery } from "@/hooks/use-swr-query"

interface OptimisticMutationOptions<T, U> {
    onSuccess?: (data: U) => void
    onError?: (error: Error) => void
    optimisticUpdate?: (currentData: T, args: any) => T
    revalidate?: boolean
    successMessage?: string
    errorMessage?: string
}

export function useOptimisticMutation<T = any, U = any>(
    mutationFn: any,
    queryFn: any,
    queryArgs: any,
    options: OptimisticMutationOptions<T, U> = {},
) {
    const {
        onSuccess,
        onError,
        optimisticUpdate,
        revalidate = true,
        successMessage,
        errorMessage = "An error occurred. Please try again.",
    } = options

    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)
    const mutation = useMutation(mutationFn)

    // Use our custom SWR hook for the query
    const { data, mutate } = useSWRQuery<T>(queryFn, queryArgs)

    const execute = useCallback(
        async (args: any) => {
            setIsLoading(true)

            try {
                // Apply optimistic update if provided
                if (optimisticUpdate && data) {
                    await mutate(optimisticUpdate(data, args))
                }

                // Execute the actual mutation
                const result = await mutation(args)

                // Show success message if provided
                if (successMessage) {
                    toast({
                        title: "Success",
                        description: successMessage,
                    })
                }

                // Revalidate the query if needed
                if (revalidate) {
                    await mutate()
                }

                // Call onSuccess callback if provided
                if (onSuccess) {
                    onSuccess(result)
                }

                return result
            } catch (err) {
                // Revert optimistic update
                if (optimisticUpdate) {
                    await mutate()
                }

                // Show error message
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                })

                // Call onError callback if provided
                const error = err instanceof Error ? err : new Error(String(err))
                if (onError) {
                    onError(error)
                }

                throw error
            } finally {
                setIsLoading(false)
            }
        },
        [mutation, data, mutate, optimisticUpdate, revalidate, successMessage, errorMessage, toast, onSuccess, onError],
    )

    return {
        execute,
        isLoading,
    }
}

