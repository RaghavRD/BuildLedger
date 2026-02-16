"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { LogoutConfirmationDialog } from "./logout-confirmation-dialog"

export function DashboardHeader({ user }: { user?: { name?: string | null } }) {
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

    return (
        <header className="mb-6 sm:mb-8 flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
                <Image
                    src="/BuildLedger.png"
                    alt="BuildLedger Logo"
                    width={40}
                    height={40}
                    className="shrink-0"
                />
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">BuildLedger</h1>
                    <p className="text-[10px] sm:text-sm text-gray-500 truncate">
                        Welcome, {user?.name?.split(' ')[0] || "User"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 px-2 sm:px-3 sm:text-sm sm:h-9 text-gray-600 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setIsLogoutDialogOpen(true)}
                >
                    Sign out
                </Button>
            </div>

            <LogoutConfirmationDialog
                isOpen={isLogoutDialogOpen}
                onOpenChange={setIsLogoutDialogOpen}
            />
        </header>
    )
}
