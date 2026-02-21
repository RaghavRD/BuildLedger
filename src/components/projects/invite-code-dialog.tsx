"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Copy, Key } from "lucide-react"

export function InviteCodeDialog({ projectName, inviteCode }: { projectName: string; inviteCode: string }) {
    const [open, setOpen] = useState(false)

    const handleCopy = async () => {
        try {
            const message = `Join me on the ${projectName} project on BuildLedger!\n\nInvite Code: ${inviteCode}\n\nEnter this code on the dashboard to request access.`
            await navigator.clipboard.writeText(message)
            toast.success("Invitation copied to clipboard!")
        } catch (err) {
            toast.error("Failed to copy invitation")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" size="sm" className="h-8 gap-2 uppercase tracking-wide font-medium">
                    <Key className="h-3.5 w-3.5" />
                    Invite Code
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Project Invite Code</DialogTitle>
                    <DialogDescription>
                        Share this code to allow colleagues to join <span className="font-semibold text-gray-900">{projectName}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-2 pt-4">
                    <div className="grid flex-1 gap-2">
                        <Input
                            id="invite-code"
                            value={inviteCode}
                            readOnly
                            className="bg-gray-50/50 font-mono tracking-widest text-center text-lg font-bold"
                        />
                    </div>
                    <Button onClick={handleCopy} size="icon" className="shrink-0" title="Copy to clipboard">
                        <span className="sr-only">Copy</span>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
