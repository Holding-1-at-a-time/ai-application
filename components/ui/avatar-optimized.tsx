import Image from "next/image"
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AvatarOptimizedProps {
    src?: string | null
    alt: string
    fallback: string
    size?: number
    className?: string
}

export function AvatarOptimized({ src, alt, fallback, size = 40, className }: AvatarOptimizedProps) {
    return (
        <ShadcnAvatar className={className}>
            {src ? (
                <div className="relative aspect-square h-full w-full">
                    <Image
                        src={src || "/placeholder.svg"}
                        alt={alt}
                        fill
                        sizes={`${size}px`}
                        className="rounded-full object-cover"
                        priority={size > 80} // Prioritize larger avatars
                    />
                </div>
            ) : (
                <AvatarImage src="" alt={alt} />
            )}
            <AvatarFallback>{fallback}</AvatarFallback>
        </ShadcnAvatar>
    )
}

