"use client"

import { useState, useEffect } from "react"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { resolveAccessRequest, getGlobalPendingRequests } from "@/lib/actions/access-requests"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function NotificationsDropdown() {
    const [requests, setRequests] = useState<any[]>([])
    const [open, setOpen] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchRequests() {
            try {
                const data = await getGlobalPendingRequests()
                setRequests(data || [])
            } catch (err) {
                console.error("Failed to load notifications")
            } finally {
                setIsLoading(false)
            }
        }
        fetchRequests()
    }, [])

    const pendingCount = requests.length

    async function handleResolve(requestId: string, approve: boolean) {
        setLoadingId(requestId)
        const result = await resolveAccessRequest(requestId, approve)

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success(approve ? "Request approved" : "Request declined")
            // Optimistically remove from list
            setRequests(requests.filter(r => r.id !== requestId))
            router.refresh()
        }
        setLoadingId(null)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 text-gray-600 hover:text-gray-900 shrink-0"
                    title="Notifications"
                >
                    <Bell className="h-4 w-4" />
                    {pendingCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 mr-4 mt-2" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {pendingCount > 0 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                            {pendingCount} new
                        </span>
                    )}
                </div>

                <div className="max-h-[300px] overflow-y-auto">
                    {pendingCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                            <Bell className="h-8 w-8 text-gray-200 mb-3" />
                            <p className="text-sm font-medium text-gray-900">All caught up!</p>
                            <p className="text-xs text-gray-500 mt-1">Check back later for new notifications.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y">
                            {requests.map((request) => (
                                <div key={request.id} className="p-4 hover:bg-gray-50 flex flex-col gap-3">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={request.user.image || ""} />
                                            <AvatarFallback className="bg-orange-100 text-orange-700 text-xs text-xs">
                                                {request.user.name?.charAt(0) || request.user.email?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 leading-tight">
                                                <span className="font-semibold">{request.user.name || "A user"}</span> wants to join{" "}
                                                <Link href={`/projects/${request.projectId}`} className="font-semibold hover:underline" onClick={() => setOpen(false)}>
                                                    {request.project.name}
                                                </Link>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 truncate">{request.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-11 mt-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-6 px-3 text-[11px] tracking-wide font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                            onClick={() => handleResolve(request.id, false)}
                                            disabled={loadingId === request.id}
                                        >
                                            Decline
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-6 px-3 text-[11px] tracking-wide font-semibold bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleResolve(request.id, true)}
                                            disabled={loadingId === request.id}
                                        >
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
