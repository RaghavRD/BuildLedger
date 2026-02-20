"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2 } from "lucide-react"
import { deleteProject } from "@/lib/actions/projects"
import { toast } from "sonner"

interface DeleteProjectDialogProps {
    projectId: string
    projectName: string
}

export function DeleteProjectDialog({ projectId, projectName }: DeleteProjectDialogProps) {
    const [open, setOpen] = useState(false)
    const [confirmName, setConfirmName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (confirmName !== projectName) return

        setIsLoading(true)
        try {
            const result = await deleteProject(projectId, confirmName)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Project deleted successfully")
                setOpen(false)
                router.refresh()
            }
        } catch (error) {
            toast.error("An error occurred while deleting the project")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" title="Delete Project">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Project</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the project
                        and all associated data (transactions, members).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="projectName" className="text-sm font-medium">
                            To confirm, type <span className="font-bold select-none text-red-600">"{projectName}"</span> in the box below:
                        </Label>
                        <Input
                            id="projectName"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder="Type project name here"
                            className="border-red-200 focus-visible:ring-red-500"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={confirmName !== projectName || isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete Project"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
