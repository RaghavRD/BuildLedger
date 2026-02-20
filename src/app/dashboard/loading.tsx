import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8">
            <div className="mx-auto max-w-7xl">
                {/* Header skeleton */}
                <header className="mb-6 sm:mb-8 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div>
                            <Skeleton className="h-6 w-32" />
                            <Skeleton className="h-3 w-24 mt-1.5" />
                        </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded-md" />
                </header>

                {/* Stats cards skeleton */}
                <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-none shadow-sm bg-white">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-3 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-3 w-20 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Projects section header */}
                <div className="flex items-center justify-between mb-6">
                    <Skeleton className="h-7 w-24" />
                    <Skeleton className="h-9 w-32 rounded-md" />
                </div>

                {/* Project cards skeleton */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-5 w-14 rounded-full" />
                                    </div>
                                    <Skeleton className="h-8 w-8 rounded-md" />
                                </div>
                                <Skeleton className="h-4 w-full mt-2" />
                                <Skeleton className="h-4 w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                            </CardContent>
                            <div className="p-4 pt-0">
                                <Skeleton className="h-9 w-full rounded-md" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
