"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function requestProjectAccess(inviteCode: string) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return { error: "Unauthorized" }
    }

    try {
        const project = await prisma.project.findUnique({
            where: { inviteCode }
        })

        if (!project) {
            return { error: "Invalid invite code" }
        }

        // Check if user is already a member
        const existingMember = await prisma.project.findUnique({
            where: { id: project.id },
            include: { members: { where: { id: session.user.id } } }
        })

        if (existingMember?.members.length) {
            return { error: "You are already a member of this project" }
        }

        // Check if request already exists
        const existingRequest = await prisma.accessRequest.findUnique({
            where: {
                projectId_userId: {
                    projectId: project.id,
                    userId: session.user.id
                }
            }
        })

        if (existingRequest) {
            return { error: `Request is already ${existingRequest.status.toLowerCase()}` }
        }

        await prisma.accessRequest.create({
            data: {
                projectId: project.id,
                userId: session.user.id,
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to request access:", error)
        return { error: "Failed to request access" }
    }
}

export async function getPendingRequests(projectId: string) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return []
    }

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { ownerId: true }
        })

        if (!project) {
            return []
        }

        // Only ADMIN or Project Owner can view requests
        if (session.user.role !== "ADMIN" && session.user.id !== project.ownerId) {
            return []
        }

        const requests = await prisma.accessRequest.findMany({
            where: {
                projectId,
                status: "PENDING"
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, image: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return requests
    } catch (error) {
        console.error("Failed to fetch pending requests:", error)
        return []
    }
}

export async function getGlobalPendingRequests() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return []
    }

    try {
        const isAdmin = session.user.role === "ADMIN"

        // Find all projects where the user is an owner (or all projects if ADMIN)
        const whereClause = isAdmin
            ? {}
            : { ownerId: session.user.id }

        const ownedProjects = await prisma.project.findMany({
            where: whereClause,
            select: { id: true, name: true }
        })

        if (!ownedProjects.length) return []

        const projectIds = ownedProjects.map(p => p.id)

        // Find pending requests for all these projects
        const requests = await prisma.accessRequest.findMany({
            where: {
                projectId: { in: projectIds },
                status: "PENDING"
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true, image: true }
                },
                project: {
                    select: { id: true, name: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return requests
    } catch (error) {
        console.error("Failed to fetch global pending requests:", error)
        return []
    }
}

export async function resolveAccessRequest(requestId: string, approve: boolean) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return { error: "Unauthorized" }
    }

    try {
        const request = await prisma.accessRequest.findUnique({
            where: { id: requestId },
            include: { project: true }
        })

        if (!request) {
            return { error: "Request not found" }
        }

        // Only ADMIN or Project Owner can resolve requests
        if (session.user.role !== "ADMIN" && session.user.id !== request.project.ownerId) {
            return { error: "Unauthorized to resolve this request" }
        }

        if (request.status !== "PENDING") {
            return { error: "Request is already resolved" }
        }

        if (approve) {
            // Update request status and add to project concurrently
            await prisma.$transaction([
                prisma.accessRequest.update({
                    where: { id: requestId },
                    data: { status: "APPROVED" }
                }),
                prisma.project.update({
                    where: { id: request.projectId },
                    data: {
                        members: {
                            connect: { id: request.userId }
                        }
                    }
                })
            ])
        } else {
            await prisma.accessRequest.update({
                where: { id: requestId },
                data: { status: "REJECTED" }
            })
        }

        revalidatePath(`/projects/${request.projectId}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to resolve request:", error)
        return { error: "Failed to resolve request" }
    }
}
