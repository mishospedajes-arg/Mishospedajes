import { Skeleton } from '@/components/ui/skeleton';

export const SearchBarSkeleton = () => {
  return (
    <>
      <div className="md:hidden w-full px-4">
        <div className="w-full rounded-full flex items-center justify-start px-4 py-4 shadow-sm border border-gray-200 bg-white h-14">
          <Skeleton className="h-5 w-5 mr-3 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="hidden md:flex bg-white border-gray-200 rounded-full shadow-lg flex-row items-center w-full md:max-w-2xl lg:max-w-[75%] px-1">
        <div className="flex-1 px-6 py-3">
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-3 w-20" />
        </div>

        <div className="h-8 border-l border-gray-200"></div>

        <div className="flex-1 px-6 py-3">
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>

        <div className="h-8 border-l border-gray-200"></div>

        <div className="flex-1 px-6 py-3">
          <Skeleton className="h-3 w-20 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>

        <div className="p-2">
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
      </div>
    </>
  );
};
