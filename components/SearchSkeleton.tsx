import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const SearchSkeleton = () => {
  return (
    <div className="relative w-full sm:w-1/3">
      <Skeleton className="w-full h-10 rounded-xl" />
    </div>
  );
};

export default SearchSkeleton;
