"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

interface LogoutConfirmationDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function LogoutConfirmationDialog({
    isOpen,
    onOpenChange,
}: LogoutConfirmationDialogProps) {
    const handleLogout = () => {
        signOut({ callbackUrl: "/login" })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sign Out</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to sign out? You will need to log in again to access your account.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row gap-2 sm:justify-end">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 sm:flex-none"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="flex-1 sm:flex-none"
                    >
                        Sign Out
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
