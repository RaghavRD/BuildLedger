"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function getDashboardStats() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return {
            totalProjects: 0,
            totalSpend: 0,
            activeBudget: 0,
            monthlySpend: 0
        }
    }

    try {
        const projects = await prisma.project.findMany({
            where: {
                members: {
                    some: {
                        id: session.user.id,
                    },
                },
            },
            include: {
                transactions: true
            }
        })

        const totalProjects = projects.length

        const activeBudget = projects.reduce((acc, project) => acc + project.budget, 0)

        let totalSpend = 0
        let monthlySpend = 0

        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        projects.forEach(project => {
            project.transactions.forEach(tx => {
                const amount = tx.type === "CREDIT" ? -tx.amount : tx.amount
                totalSpend += amount
                if (new Date(tx.date) >= firstDayOfMonth) {
                    monthlySpend += amount
                }
            })
        })

        return {
            totalProjects,
            totalSpend,
            activeBudget,
            monthlySpend
        }

    } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
        return {
            totalProjects: 0,
            totalSpend: 0,
            activeBudget: 0,
            monthlySpend: 0
        }
    }
}
