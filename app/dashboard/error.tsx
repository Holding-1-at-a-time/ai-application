'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/router'

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}


export default function DashboardError({ error, reset }: ErrorProps) {
    const router = useRouter()
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard error:', error)
    }, [error])

    return (
        <div className="flex items-center justify-center min-h-[80vh] p-4">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="h-6 w-6 text-destructive" />
                        <CardTitle>Something went wrong</CardTitle>
                    </div>
                    <CardDescription>
                        There was an error loading the dashboard data
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-muted p-4 rounded-md mb-4">
                        <p className="text-sm font-mono break-all">
                            {error.message || 'An unexpected error occurred'}
                        </p>
                        {error.digest && (
                            <p className="text-xs text-muted-foreground mt-2">
                                Error ID: {error.digest}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2 text-sm">
                        <p>You can try:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Refreshing the page</li>
                            <li>Checking your internet connection</li>
                            <li>Contacting support if the problem persists</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go Back
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => router.push('/')}>
                            <Home className="mr-2 h-4 w-4" />
                            Home
                        </Button>
                    </div>
                    <Button onClick={() => reset()} size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

