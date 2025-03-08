"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { FormFeedback } from "@/components/ui/form-feedback"
import { LoadingState } from "@/components/ui/loading-state"
import { CsrfForm } from "@/components/ui/csrf-form"

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
})

export function LoginForm() {
    const { signIn } = useAuth()
    const { toast } = useToast()
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [formError, setFormError] = React.useState<string | null>(null)
    const [formSuccess, setFormSuccess] = React.useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setFormError(null)
        setFormSuccess(null)

        try {
            await signIn(values.email, values.password)
            setFormSuccess("Login successful! Redirecting...")

            toast({
                title: "Success",
                description: "You have successfully logged in.",
            })

            // Short delay for better UX
            setTimeout(() => {
                router.push("/dashboard")
            }, 1000)
        } catch (error) {
            setFormError("Invalid email or password. Please try again.")

            toast({
                title: "Error",
                description: "Invalid email or password. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid gap-6">
            {formError && <FormFeedback type="error" message={formError} />}
            {formSuccess && <FormFeedback type="success" message={formSuccess} />}

            <CsrfForm onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <Form {...form}>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="email">Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            placeholder="name@example.com"
                                            {...field}
                                            type="email"
                                            autoComplete="email"
                                            aria-required="true"
                                            disabled={isLoading}
                                            className="focus-visible:ring-ring"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel htmlFor="password">Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="********"
                                            {...field}
                                            autoComplete="current-password"
                                            aria-required="true"
                                            disabled={isLoading}
                                            className="focus-visible:ring-ring"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full shadow-glow" disabled={isLoading} aria-disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <LoadingState size="sm" text="" className="mr-2" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </div>
                </Form>
            </CsrfForm>
        </div>
    )
}

