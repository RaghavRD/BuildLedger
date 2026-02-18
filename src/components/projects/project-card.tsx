import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { DeleteProjectDialog } from "./delete-project-dialog"

interface ProjectProps {
    id: string
    name: string
    description: string | null
    budget: number
    startDate: Date | null
    endDate: Date | null
    status: string
    _count: {
        members: number
    }
    isAdmin?: boolean
}

const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 border-green-200",
    COMPLETED: "bg-blue-100 text-blue-700 border-blue-200",
    ON_HOLD: "bg-yellow-100 text-yellow-700 border-yellow-200",
}

export function ProjectCard({ project }: { project: ProjectProps }) {
    // Simple currency formatter
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
    })

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <CardTitle className="truncate">{project.name}</CardTitle>
                        <Badge className={`${statusColors[project.status] || "bg-gray-100"} capitalize border shadow-none shrink-0`}>
                            {(project.status || "active").toLowerCase().replace('_', ' ')}
                        </Badge>
                    </div>
                    {project.isAdmin && (
                        <DeleteProjectDialog
                            projectId={project.id}
                            projectName={project.name}
                        />
                    )}
                </div>
                <CardDescription className="line-clamp-2 h-10">
                    {project.description || "No description provided."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Budget:</span>
                        <span className="font-semibold">{formatter.format(project.budget)}</span>
                    </div>
                    {(project.startDate || project.endDate) && (
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>Timeline:</span>
                            <span>
                                {project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : "..."} - {project.endDate ? new Date(project.endDate).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : "Present"}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Members:</span>
                        <span>{project._count.members}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href={`/projects/${project.id}`}>View Details</Link>
                </Button>
            </CardFooter>
        </Card>
    )
}
