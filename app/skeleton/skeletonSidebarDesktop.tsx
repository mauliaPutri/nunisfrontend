import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SidebarDesktopSkeleton = () => {
    return (
        <aside className="hidden md:block w-[270px] max-w-xs h-screen fixed left-0 top-0 z-40 border-r">
            <div className="h-full px-3 py-4">
                <Skeleton className="h-20 w-70 mx-auto mb-5" />
                <div className="flex flex-col gap-4 mt-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div className='flex' key={index}>
                            <Skeleton className="h-10 w-10 me-3 rounded" />
                            <Skeleton className="h-10 w-full rounded" />
                        </div>
                    ))}
                </div>
                <div className="absolute left-0 bottom-1 w-full border-t p-1">
                    <Skeleton className="flex items-center gap-2 p-4 rounded" />
                </div>
            </div>
        </aside>
    );
};

export default SidebarDesktopSkeleton;
