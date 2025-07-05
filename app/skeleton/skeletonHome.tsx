import React from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // Adjust the import according to your structure

const HomepageSkeleton = () => {
    return (
        <div className="surface-0 vh-100 pt-4 ">
            <div className="text-900 font-bold text-6xl mb-5 text-center pt-5 flex justify-center">
                <Skeleton className="h-10 w-48 rounded" />
            </div>
            <div className="container">
                <div className="flex sm:flex-row flex-col">
                    <div className="col-6 m-lg-2">
                        <div className="flex">
                            <Skeleton className="h-40 w-64 rounded" />
                            <div className="flex-col ml-4">
                                <Skeleton className="h-40 w-52 rounded mb-4" />
                                <Skeleton className="h-40 w-52 rounded" />
                            </div>
                        </div>
                    </div>
                    <div className="w-full m-lg-2 text-xl">
                        <h1 className="text-4xl font-bold mb-4">
                            <Skeleton className="h-10 w-36 rounded" />
                        </h1>
                        <Skeleton className="h-4 w-full rounded mb-2" />
                        <Skeleton className="h-4 w-full rounded mb-2" />
                        <Skeleton className="h-4 w-3/4 rounded mb-2" />
                        <b>
                            <Skeleton className="h-4 w-48 rounded" />
                        </b>
                        <b>
                            <Skeleton className="h-4 w-48 rounded" />
                        </b>
                        <b>
                            <Skeleton className="h-4 w-48 rounded" />
                        </b>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomepageSkeleton;
