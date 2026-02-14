"use client"

import { Button } from "@/components/ui/button"
import { removeMemberFromProject } from "@/lib/actions/projects"
import { toast } from "sonner"
import { X } from "lucide-react"
import { useState } from "react"

interface Member {
    id: string
    name: string | null
    email: string | null
    role: string
}

export function MemberList({
    members,
    projectId,
    ownerId,
    isAdmin,
}: {
    members: Member[]
    projectId: string
    ownerId: string
    isAdmin: boolean
}) {
    const [removing, setRemoving] = useState<string | null>(null)

    async function handleRemove(userId: string) {
        setRemoving(userId)
        const result = await removeMemberFromProject(projectId, userId)
        setRemoving(null)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Member removed")
        }
    }

    return (
        <div className="divide-y divide-gray-100">
            {members.map((member) => (
                <div key={member.id} className="flex flex-col xs:flex-row xs:items-center justify-between py-3 px-1 gap-2 border-b border-gray-50 last:border-0 group">
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-gray-900 truncate">{member.name || "Unnamed User"}</p>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 truncate max-w-[200px] xs:max-w-none">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-auto xs:ml-4">
                        <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-tight border ${member.id === ownerId
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : member.role === "ADMIN"
                                ? "bg-purple-50 text-purple-700 border-purple-100"
                                : "bg-gray-50 text-gray-600 border-gray-100"
                            }`}
                        >
                            {member.id === ownerId ? "ADMIN" : member.role}
                        </span>
                        {isAdmin && member.id !== ownerId && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemove(member.id)}
                                disabled={removing === member.id}
                            >
                                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
