import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const BreadcrumbSkeleton = () => (
  <div>
    <Skeleton className="w-1/4 h-4 mb-2" />
    <Skeleton className="w-1/2 h-8" />
  </div>
);

export const SearchSkeleton = () => (
  <div className="relative w-full sm:w-1/3">
    <Skeleton className="w-full h-10 rounded-xl" />
  </div>
);

export const ActionButtonSkeleton = () => (
  <div className="flex gap-4">
    <Skeleton className="w-20 h-10 rounded-full" />
  </div>
);

export const TableSkeleton = () => {
  const rows = Array.from({ length: 5 }, (_, index) => (
    <tr key={index} className="animate-pulse">
      {Array.from({ length: 8 }, (_, cellIndex) => (
        <td key={cellIndex} className="p-2">
          <Skeleton className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  ));

  return (
    <table className="min-w-full overflow-x-auto border">
      <thead>
        <tr>
          {Array.from({ length: 8 }, (_, cellIndex) => (
            <th key={cellIndex} className="p-2 bg-gray-300">
              <Skeleton className="h-4 w-full rounded" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
};
