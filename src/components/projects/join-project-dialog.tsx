"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { requestProjectAccess } from "@/lib/actions/access-requests"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Key } from "lucide-react"

export function JoinProjectDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [inviteCode, setInviteCode] = useState("")
    const router = useRouter()

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)

        if (!inviteCode || inviteCode.trim() === "") {
            toast.error("Please enter a valid invite code")
            setIsLoading(false)
            return
        }

        const result = await requestProjectAccess(inviteCode.trim())

        if (result?.error) {
            toast.error(result.error)
        } else {
            toast.success("Access request sent to project owner")
            setOpen(false)
            setInviteCode("")
            router.refresh()
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Key className="h-4 w-4" />
                    Join Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Join a Project</DialogTitle>
                    <DialogDescription>
                        Enter the unique invite code provided by the project owner to request access.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="inviteCode" className="text-right">
                                Invite Code
                            </Label>
                            <Input
                                id="inviteCode"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="e.g. clabc12345"
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Sending Request..." : "Request Access"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
