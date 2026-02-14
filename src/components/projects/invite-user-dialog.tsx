"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addMemberToProject } from "@/lib/actions/projects"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"

export function InviteUserDialog({ projectId }: { projectId: string }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState("")

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const result = await addMemberToProject(projectId, email)

        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("User invited successfully")
            setEmail("")
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full xs:w-auto text-xs sm:text-sm h-9 sm:h-8">
                    <UserPlus className="mr-1 sm:mr-2 h-4 w-4" /> Invite User
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Invite User</DialogTitle>
                        <DialogDescription>
                            Enter the email of a registered user to add them to this project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <Label htmlFor="email" className="font-semibold text-sm">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-2 h-11 sm:h-9"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                            {isLoading ? "Inviting..." : "Invite User"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
