export function Skeleton({ className = '' }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
        </div>
    );
}

export function SkeletonStatCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-16" />
        </div>
    );
}
