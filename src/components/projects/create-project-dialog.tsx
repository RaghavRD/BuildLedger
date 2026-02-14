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
import { createProject } from "@/lib/actions/projects"
import { toast } from "sonner"

export function CreateProjectDialog() {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const result = await createProject(formData)

        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Project created successfully")
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Create Project</DialogTitle>
                        <DialogDescription>
                            Add a new project to track expenses and budget.
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
                                placeholder="Project Name"
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
                                placeholder="What is this project about?"
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
                                placeholder="0.00"
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
                                className="sm:col-span-3 h-11 sm:h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue="ACTIVE"
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Project"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
