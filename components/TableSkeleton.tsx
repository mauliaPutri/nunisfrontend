import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const TableSkeleton = () => {
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

export default TableSkeleton;
