import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while cards for a board are being fetched for the first time.
 * Matches the visual footprint of a real BoardColumn (288px wide).
 */
export function BoardColumnSkeleton() {
    return (
        <div className="shrink-0 w-[288px] ml-2 rounded-xl border border-border/80 bg-secondary/50 shadow-sm min-h-[620px] p-4 space-y-3">
            {/* Column header */}
            <div className="flex items-center gap-3 pb-2">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-14" />
                </div>
            </div>

            {/* Cards */}
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border/60 bg-card p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="flex gap-1 pt-1">
                        <Skeleton className="h-5 w-12 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                </div>
            ))}

            {/* Add card ghost button */}
            <Skeleton className="h-9 w-full rounded-lg" />
        </div>
    );
}
