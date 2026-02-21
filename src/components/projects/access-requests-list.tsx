"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { resolveAccessRequest } from "@/lib/actions/access-requests"
import { Check, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type RequestType = {
    id: string
    user: {
        id: string
        name: string | null
        email: string | null
        image: string | null
    }
}

export function AccessRequestsList({ requests, projectId }: { requests: RequestType[], projectId: string }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    if (requests.length === 0) return null

    async function handleResolve(requestId: string, approve: boolean) {
        setLoadingId(requestId)
        const result = await resolveAccessRequest(requestId, approve)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(approve ? "Request approved" : "Request declined")
        }
        setLoadingId(null)
    }

    return (
        <div className="mb-6">
            <h3 className="text-sm font-bold tracking-tight text-gray-900 mb-3 px-1">Pending Requests ({requests.length})</h3>
            <div className="bg-orange-50/50 border border-orange-200/50 rounded-lg overflow-hidden">
                <div className="divide-y divide-orange-100">
                    {requests.map((request) => (
                        <div key={request.id} className="p-3 sm:p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-white">
                                    <AvatarImage src={request.user.image || ""} />
                                    <AvatarFallback className="bg-orange-100 text-orange-700 text-xs sm:text-sm">
                                        {request.user.name?.charAt(0) || request.user.email?.charAt(0) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {request.user.name || "Unknown User"}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {request.user.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    onClick={() => handleResolve(request.id, false)}
                                    disabled={loadingId === request.id}
                                >
                                    <X className="h-4 w-4 sm:mr-1.5" />
                                    <span className="hidden sm:inline">Decline</span>
                                </Button>
                                <Button
                                    size="sm"
                                    className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleResolve(request.id, true)}
                                    disabled={loadingId === request.id}
                                >
                                    <Check className="h-4 w-4 sm:mr-1.5" />
                                    <span className="hidden sm:inline">Approve</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
