import { Loader2 } from "lucide-react"

interface LoadingStateProps {
    text?: string
    size?: "sm" | "md" | "lg"
    fullPage?: boolean
    className?: string
}

export function LoadingState({
    text = "Loading...",
    size = "md",
    fullPage = false,
    className = "",
}: LoadingStateProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    }

    const containerClasses = fullPage
        ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
        : "flex flex-col items-center justify-center p-8"

    return (
        <div className={`${containerClasses} ${className}`} role="status" aria-live="polite">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mb-2`} aria-hidden="true" />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
            <span className="sr-only">{text}</span>
        </div>
    )
}

