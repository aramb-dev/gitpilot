import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    }

    return (
        <Loader2
            className={cn('animate-spin text-[#58a6ff]', sizeClasses[size], className)}
            aria-label="Loading"
        />
    )
}

export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Spinner size="lg" />
            <p className="text-gray-400 text-sm">{message}</p>
        </div>
    )
}

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className="h-14 bg-gray-800/30 rounded animate-pulse"
                    style={{
                        animationDelay: `${index * 50}ms`,
                    }}
                />
            ))}
        </div>
    )
}
