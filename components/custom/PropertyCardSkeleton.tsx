import { Skeleton } from "@/components/ui/skeleton";

export function PropertyCardSkeleton() {
    return (
        <div className="flex flex-col h-full w-full">
            <div className="relative rounded-xl overflow-hidden w-full aspect-square mb-2">
                <Skeleton className="w-full h-full" />
            </div>
            <div className="px-1 pt-0 -mt-2 flex flex-col flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2 mt-2" />
                <div className="flex items-center justify-between pt-0 mt-1">
                    <div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
                        <span className="flex items-center gap-1.5">
                            <Skeleton className="w-4 h-4 rounded-full" />
                            <Skeleton className="w-4 h-4 rounded" />
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Skeleton className="w-4 h-4 rounded-full" />
                            <Skeleton className="w-4 h-4 rounded" />
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Skeleton className="w-4 h-4 rounded-full" />
                            <Skeleton className="w-4 h-4 rounded" />
                        </span>
                    </div>
                    <div className="flex items-center gap-1 pr-1 pl-3 shrink-0">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="w-8 h-4 ml-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}
