"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { LogoutConfirmationDialog } from "./logout-confirmation-dialog"
import { LogOut } from "lucide-react"
import { getGlobalPendingRequests } from "@/lib/actions/access-requests"
import { NotificationsDropdown } from "./notifications-dropdown"

export function DashboardHeader({ user }: { user?: { name?: string | null } }) {
    return (
        <header className="mb-6 sm:mb-8 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
                <Image
                    src="/BuildLedger.png"
                    alt="BuildLedger Logo"
                    width={36}
                    height={36}
                    className="shrink-0"
                />
                <div className="min-w-0">
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">BuildLedger</h1>
                    <p className="text-xs text-gray-500 truncate">
                        Welcome, {user?.name?.split(' ')[0] || "User"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <NotificationsDropdown />
                <DashboardHeaderClient />
            </div>
        </header>
    )
}

function DashboardHeaderClient() {
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-red-50 shrink-0"
                onClick={() => setIsLogoutDialogOpen(true)}
                title="Sign out"
            >
                <LogOut className="h-4 w-4" />
            </Button>

            <LogoutConfirmationDialog
                isOpen={isLogoutDialogOpen}
                onOpenChange={setIsLogoutDialogOpen}
            />
        </>
    )
}
