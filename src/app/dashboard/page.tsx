import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getProjects } from "@/lib/actions/projects"
import { getDashboardStats } from "@/lib/actions/analytics"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { JoinProjectDialog } from "@/components/projects/join-project-dialog"
import { ProjectCard } from "@/components/projects/project-card"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const projects = await getProjects()
    const stats = await getDashboardStats()
    const isAdmin = session.user.role === "ADMIN"

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8">
            <div className="mx-auto max-w-7xl">
                <DashboardHeader user={session.user} />

                <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
                    <Card className="xs:col-span-1 lg:col-span-1 border-none shadow-sm bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalProjects}</div>
                        </CardContent>
                    </Card>

                    <Card className="xs:col-span-1 lg:col-span-1 border-none shadow-sm bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Month Spend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl sm:text-3xl font-bold text-red-600 truncate">
                                <span className="lg:hidden">{formatCurrency(stats.monthlySpend, { compact: true })}</span>
                                <span className="hidden lg:inline">{formatCurrency(stats.monthlySpend)}</span>
                            </div>
                            <p className="text-[10px] text-red-600/70 mt-1 truncate">
                                Lifetime:
                                <span className="lg:hidden ml-1">{formatCurrency(stats.totalSpend, { compact: true })}</span>
                                <span className="hidden lg:inline ml-1">{formatCurrency(stats.totalSpend)}</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="xs:col-span-2 lg:col-span-1 border-none shadow-sm bg-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Budget</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl sm:text-3xl font-bold text-green-600 truncate">
                                +
                                <span className="lg:hidden">{formatCurrency(stats.activeBudget, { compact: true })}</span>
                                <span className="hidden lg:inline">{formatCurrency(stats.activeBudget)}</span>
                            </div>
                            <p className="text-[10px] text-green-600/70 mt-1 truncate">Ready for allocation</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Projects</h2>
                    <div className="flex items-center gap-3">
                        <JoinProjectDialog />
                        <CreateProjectDialog />
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-dashed flex flex-col items-center justify-center space-y-4">
                        <p className="text-muted-foreground mb-2">
                            No projects found. Create one or join an existing project to get started.
                        </p>
                        <div className="flex items-center gap-4">
                            <JoinProjectDialog />
                            <CreateProjectDialog />
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {projects.map((project: any) => (
                            <ProjectCard
                                key={project.id}
                                project={{ ...project, isAdmin: session.user.role === "ADMIN" || project.ownerId === session.user.id }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
