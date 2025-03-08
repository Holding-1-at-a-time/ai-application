import { AlertCircle, CheckCircle2 } from "lucide-react"

interface FormFeedbackProps {
    type: "error" | "success" | "info"
    message: string
    className?: string
}

export function FormFeedback({ type, message, className = "" }: FormFeedbackProps) {
    const iconMap = {
        error: <AlertCircle className="h-4 w-4 text-destructive" />,
        success: <CheckCircle2 className="h-4 w-4 text-primary" />,
        info: <AlertCircle className="h-4 w-4 text-secondary" />,
    }

    const bgColorMap = {
        error: "bg-destructive/10",
        success: "bg-primary/10",
        info: "bg-secondary/10",
    }

    const textColorMap = {
        error: "text-destructive",
        success: "text-primary",
        info: "text-secondary",
    }

    return (
        <div
            className={`flex items-center gap-2 rounded-md p-2 text-sm ${bgColorMap[type]} ${textColorMap[type]} ${className}`}
            role={type === "error" ? "alert" : "status"}
            aria-live={type === "error" ? "assertive" : "polite"}
        >
            {iconMap[type]}
            <span>{message}</span>
        </div>
    )
}

