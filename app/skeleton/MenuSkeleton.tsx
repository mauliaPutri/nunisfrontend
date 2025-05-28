import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const MenuSkeleton: React.FC = () => {
  return (
    <div className="container">
      <div className="flex justify-content-end flex-col-reverse sm:flex-row me-4 sticky top-0 py-2 px-3 w-full bg-white z-10 shadow-sm rounded">
        <div className="text-start mt-2">
          <Skeleton className="h-8 w-24 mb-2" />
          <div className="flex justify-start pt-3 mb-2 gap-4 w-full overflow-x-auto">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-10 w-20" />
            ))}
          </div>
        </div>
        <div className="flex align-items-center justify-content-end sm:flex-row w-full">
          <Skeleton className="h-10 w-1/2 ms-3 me-2 mt-2 sm:w-1/2" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="rounded text-sm">
            <CardHeader>
              <Skeleton className="h-[150px] w-[120px] sm:w-[170px] rounded-lg" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
            <CardFooter className="flex sm:flex-row flex-col">
              <Skeleton className="h-6 w-1/2 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuSkeleton;