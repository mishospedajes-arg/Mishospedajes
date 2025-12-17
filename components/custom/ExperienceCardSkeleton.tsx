import { Skeleton } from "@/components/ui/skeleton";

export function ExperienceCardSkeleton() {
    return (
        <div className="block overflow-hidden rounded-lg border border-gray-200 shadow-sm h-full">
            <div className="relative h-48 w-full overflow-hidden">
                <Skeleton className="w-full h-full" />
            </div>
            <div className="p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    );
}
