"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"

const createProjectSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    budget: z.coerce.number().min(0, "Budget must be positive"),
    startDate: z.preprocess((val) => val === "" || val === null ? undefined : val, z.string().optional().transform(v => v ? new Date(v) : undefined)),
    endDate: z.preprocess((val) => val === "" || val === null ? undefined : val, z.string().optional().transform(v => v ? new Date(v) : undefined)),
    status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]).default("ACTIVE"),
})

const updateProjectSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    budget: z.coerce.number().min(0, "Budget must be positive"),
    startDate: z.preprocess((val) => val === "" || val === null ? undefined : val, z.string().optional().transform(v => v ? new Date(v) : undefined)),
    endDate: z.preprocess((val) => val === "" || val === null ? undefined : val, z.string().optional().transform(v => v ? new Date(v) : undefined)),
    status: z.enum(["ACTIVE", "COMPLETED", "ON_HOLD"]),
})

export async function createProject(formData: FormData) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return { error: "Unauthorized" }
    }



    const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        budget: formData.get("budget"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        status: formData.get("status") || "ACTIVE",
    }

    try {
        const validatedData = createProjectSchema.parse(rawData)

        // Generate a 6-character alphanumeric invite code
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        await prisma.project.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                budget: validatedData.budget,
                startDate: validatedData.startDate,
                endDate: validatedData.endDate,
                status: validatedData.status,
                inviteCode,
                ownerId: session.user.id,
                members: {
                    connect: { id: session.user.id }
                }
            },
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to create project:", error)
        return { error: "Failed to create project" }
    }
}

export async function getProjects() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return []
    }

    try {
        // ADMIN sees ALL projects, USER sees only assigned projects
        const whereClause = session.user.role === "ADMIN"
            ? {}
            : {
                members: {
                    some: {
                        id: session.user.id,
                    },
                },
            }

        const projects = await prisma.project.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { members: true },
                },
            },
        })

        return projects
    } catch (error) {
        console.error("Failed to fetch projects:", error)
        return []
    }
}

export async function getProjectById(id: string) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return null
    }

    try {
        // ADMIN can access any project, USER only if member
        const whereClause = session.user.role === "ADMIN"
            ? { id }
            : {
                id,
                members: {
                    some: {
                        id: session.user.id,
                    },
                },
            }

        const project = await prisma.project.findFirst({
            where: whereClause,
            include: {
                owner: {
                    select: { name: true, email: true }
                },
                members: {
                    select: { id: true, name: true, email: true, role: true }
                },
                transactions: {
                    orderBy: { date: 'desc' },
                    include: {
                        createdBy: {
                            select: { name: true }
                        }
                    }
                },
                _count: {
                    select: { members: true },
                },
            },
        })

        return project
    } catch (error) {
        console.error("Failed to fetch project:", error)
        return null
    }
}

export async function addMemberToProject(projectId: string, email: string) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return { error: "Unauthorized" }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return { error: "User not found. They must register first." }
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: { where: { id: user.id } } },
        })

        if (!project) {
            return { error: "Project not found" }
        }

        // Only ADMIN or Project Owner can invite users
        if (session.user.role !== "ADMIN" && session.user.id !== project.ownerId) {
            return { error: "Only admins or project owners can invite users" }
        }

        if (project.members.length > 0) {
            return { error: "User is already a member of this project" }
        }

        await prisma.project.update({
            where: { id: projectId },
            data: {
                members: {
                    connect: { id: user.id },
                },
            },
        })

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to add member:", error)
        return { error: "Failed to add member" }
    }
}

export async function removeMemberFromProject(projectId: string, userId: string) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return { error: "Unauthorized" }
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
        })

        if (!project) {
            return { error: "Project not found" }
        }

        // Only ADMIN or Project Owner can remove users
        if (session.user.role !== "ADMIN" && session.user.id !== project.ownerId) {
            return { error: "Only admins or project owners can remove users" }
        }

        // Cannot remove the project admin
        if (project.ownerId === userId) {
            return { error: "Cannot remove the project admin" }
        }

        await prisma.project.update({
            where: { id: projectId },
            data: {
                members: {
                    disconnect: { id: userId },
                },
            },
        })

        revalidatePath(`/projects/${projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to remove member:", error)
        return { error: "Failed to remove member" }
    }
}
export async function updateProject(formData: FormData) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return { error: "Unauthorized" }
    }

    const rawData = {
        id: formData.get("id"),
        name: formData.get("name"),
        description: formData.get("description"),
        budget: formData.get("budget"),
        startDate: formData.get("startDate"),
        endDate: formData.get("endDate"),
        status: formData.get("status"),
    }

    try {
        const validatedData = updateProjectSchema.parse(rawData)

        const project = await prisma.project.findUnique({
            where: { id: validatedData.id },
            select: { ownerId: true }
        })

        if (!project) {
            return { error: "Project not found" }
        }

        if (session.user.role !== "ADMIN" && session.user.id !== project.ownerId) {
            return { error: "Only admins or project owners can update projects" }
        }

        await prisma.project.update({
            where: { id: validatedData.id },
            data: {
                name: validatedData.name,
                description: validatedData.description,
                budget: validatedData.budget,
                startDate: validatedData.startDate,
                endDate: validatedData.endDate,
                status: validatedData.status,
            },
        })

        revalidatePath("/dashboard")
        revalidatePath(`/projects/${validatedData.id}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to update project:", error)
        return { error: "Failed to update project" }
    }
}

export async function deleteProject(projectId: string, name: string) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return { error: "Unauthorized" }
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { name: true, ownerId: true }
        })

        if (!project) {
            return { error: "Project not found" }
        }

        if (session.user.role !== "ADMIN" && session.user.id !== project.ownerId) {
            return { error: "Only admins or project owners can delete projects" }
        }

        // Case-sensitive name verification
        if (project.name !== name) {
            return { error: "Project name does not match. Deletion aborted." }
        }

        await prisma.project.delete({
            where: { id: projectId },
        })

        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete project:", error)
        return { error: "Failed to delete project" }
    }
}
