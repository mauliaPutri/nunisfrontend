import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

export function ProfileSkeleton() {
    return (
        <div className="container h-screen flex items-center justify-center">
            <Card className="p-5 w-full sm:w-1/2">
                <div className="flex items-center justify-center mb-3">
                    <Avatar className="h-[150px] w-[150px]">
                        <AvatarFallback>
                            <Skeleton className="h-full w-full rounded-full" />
                        </AvatarFallback>
                    </Avatar>
                </div>

                <div className="mt-4 space-y-4">
                    {[...Array(4)].map((_, index) => (
                        <div key={index}>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-[200px]" />
                            </div>
                        </div>
                    ))}

                    <Separator className="my-2" />
                    <div className="flex justify-center">
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            </Card>
        </div>
    )
}