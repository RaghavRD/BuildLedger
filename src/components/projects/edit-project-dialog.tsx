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
import { updateProject } from "@/lib/actions/projects"
import { toast } from "sonner"
import { Settings2 } from "lucide-react"

interface EditProjectDialogProps {
    project: {
        id: string
        name: string
        description: string | null
        budget: number
        startDate?: Date | null
        endDate?: Date | null
        status?: string
    }
}

export function EditProjectDialog({ project }: EditProjectDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    // Format date for input type="date" (YYYY-MM-DD)
    const formatDate = (date: Date | null | undefined) => {
        if (!date) return ""
        return new Date(date).toISOString().split('T')[0]
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const result = await updateProject(formData)

        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Project updated successfully")
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Edit Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <input type="hidden" name="id" value={project.id} />
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Update project details and budget.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="name" className="sm:text-right font-semibold">
                                Name
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={project.name}
                                className="sm:col-span-3 h-11 sm:h-9"
                                required
                            />
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="description" className="sm:text-right font-semibold">
                                Description
                            </Label>
                            <Input
                                id="description"
                                name="description"
                                defaultValue={project.description || ""}
                                className="sm:col-span-3 h-11 sm:h-9"
                            />
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="budget" className="sm:text-right font-semibold">
                                Budget
                            </Label>
                            <Input
                                id="budget"
                                name="budget"
                                type="number"
                                defaultValue={project.budget}
                                className="sm:col-span-3 h-11 sm:h-9"
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="startDate" className="sm:text-right font-semibold">
                                Start Date
                            </Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                defaultValue={formatDate(project.startDate)}
                                className="sm:col-span-3 h-11 sm:h-9"
                            />
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="endDate" className="sm:text-right font-semibold">
                                End Date
                            </Label>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="date"
                                defaultValue={formatDate(project.endDate)}
                                className="sm:col-span-3 h-11 sm:h-9"
                            />
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="status" className="sm:text-right font-semibold">
                                Status
                            </Label>
                            <select
                                id="status"
                                name="status"
                                className="sm:col-span-3 h-11 sm:h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                defaultValue={project.status || "ACTIVE"}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
