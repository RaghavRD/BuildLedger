import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { NextResponse, NextRequest } from "next/server"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    const { id } = await params

    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                projectId: id,
                project: {
                    members: {
                        some: { id: session.user.id }
                    }
                }
            },
            orderBy: { date: "desc" },
            include: {
                createdBy: { select: { name: true } }
            }
        })

        const csvHeader = "Date,Category,Description,Amount,CreatedBy,Notes\n"
        const csvRows = transactions.map(tx => {
            const date = new Date(tx.date).toISOString().split('T')[0]
            const notes = tx.notes ? `"${tx.notes.replace(/"/g, '""')}"` : ""
            const description = tx.description ? `"${tx.description.replace(/"/g, '""')}"` : ""
            const createdBy = tx.createdBy.name || "Unknown"
            return `${date},${tx.category},${description},${tx.amount},${createdBy},${notes}`
        }).join("\n")

        return new NextResponse(csvHeader + csvRows, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="transactions.csv"`,
            },
        })
    } catch (error) {
        console.error("Export error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
