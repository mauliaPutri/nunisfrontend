import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CategorySkeleton() {
  return (
    <div className="container">
      <div className='text-center mt-3'>
        <Skeleton className="h-8 w-32 mx-auto mb-2" />
        <Skeleton className="h-1 w-36 mx-auto mt-2 mb-12" />
      </div>
      <div className="container mx-auto">
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5'>
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="flex flex-col items-center p-5 h-[400px]">
              <Skeleton className="w-24 h-24 rounded-full" />
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-36" /></CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="w-48 h-48 overflow-auto scrollbar-hide">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}