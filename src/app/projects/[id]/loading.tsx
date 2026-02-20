import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function ProjectDetailLoading() {
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

                {/* Back to Dashboard */}
                <div className="mb-6">
                    <Skeleton className="h-4 w-32 mb-3" />

                    {/* Project name + actions */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-64 mt-1" />
                            <Skeleton className="h-3 w-48 mt-2" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-44 rounded-full" />
                            <Skeleton className="h-9 w-9 rounded-md" />
                            <Skeleton className="h-9 w-9 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Stats cards skeleton */}
                <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-none shadow-sm bg-white">
                            <CardHeader className="pb-2">
                                <Skeleton className="h-3 w-24" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32" />
                                {i === 1 && (
                                    <div className="mt-4">
                                        <Skeleton className="h-3 w-40 mb-2" />
                                        <Skeleton className="h-2.5 w-full rounded-full" />
                                    </div>
                                )}
                                {i === 2 && <Skeleton className="h-5 w-36 mt-2 rounded-full" />}
                                {i === 3 && <Skeleton className="h-3 w-24 mt-2" />}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Transactions + Team Members */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Transactions */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <Skeleton className="h-7 w-32" />
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-36 rounded-md" />
                                <Skeleton className="h-9 w-28 rounded-md" />
                            </div>
                        </div>
                        <Card>
                            <CardContent className="p-0 divide-y">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="p-4 flex items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex flex-col items-center">
                                                <Skeleton className="h-3 w-10" />
                                                <Skeleton className="h-4 w-[1px] my-1" />
                                                <Skeleton className="h-2 w-2 rounded-full" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-4 w-28" />
                                                    <Skeleton className="h-4 w-16 rounded" />
                                                </div>
                                                <Skeleton className="h-3 w-40 mt-1.5" />
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Skeleton className="h-5 w-20" />
                                            <Skeleton className="h-3 w-14 mt-1" />
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Team Members */}
                    <div className="order-1 lg:order-2">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-8 w-24 rounded-md" />
                        </div>
                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-4 space-y-3">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div>
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-3 w-36 mt-1" />
                                        </div>
                                        <Skeleton className="h-5 w-14 rounded" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
