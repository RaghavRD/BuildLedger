"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

const createTransactionSchema = z.object({
    projectId: z.string(),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    type: z.enum(["DEBIT", "CREDIT"]).default("DEBIT"),
    category: z.string().min(1, "Category is required"),
    description: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
})

const updateTransactionSchema = z.object({
    id: z.string(),
    projectId: z.string(),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    type: z.enum(["DEBIT", "CREDIT"]),
    category: z.string().min(1, "Category is required"),
    description: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
})

export async function createTransaction(formData: FormData) {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return { error: "Unauthorized" }
    }

    const rawData = {
        projectId: formData.get("projectId") as string,
        amount: formData.get("amount"),
        type: (formData.get("type") as string) || "DEBIT",
        category: formData.get("category") as string,
        description: formData.get("description") as string | null,
        notes: formData.get("notes") as string | null,
        date: formData.get("date") as string | null,
    }

    try {
        const validatedData = createTransactionSchema.parse(rawData)

        // Handle File Upload
        const file = formData.get("receipt") as File | null
        let receiptPath = null

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Create unique filename
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
            const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
            const uploadDir = join(process.cwd(), "public", "uploads")

            // Ensure directory exists
            await mkdir(uploadDir, { recursive: true })

            const filepath = join(uploadDir, filename)
            await writeFile(filepath, buffer)

            receiptPath = `/uploads/${filename}`
        }

        let transactionDate = new Date()
        if (validatedData.date) {
            const parsedDate = new Date(validatedData.date)
            if (parsedDate.toString() !== "Invalid Date") {
                transactionDate = parsedDate
            }
        }

        await prisma.transaction.create({
            data: {
                amount: validatedData.amount,
                type: validatedData.type,
                category: validatedData.category,
                description: validatedData.description || "",
                notes: validatedData.notes,
                date: transactionDate,
                receiptPath: receiptPath,
                projectId: validatedData.projectId,
                createdById: session.user.id,
            },
        })

        revalidatePath(`/projects/${validatedData.projectId}`)
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("TRANSACTION_CREATE_ERROR:", {
            error,
            rawData,
            userId: session.user.id
        })
        if (error instanceof z.ZodError) {
            return { error: `Validation Error: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}` }
        }
        const msg = error instanceof Error ? error.message : "Failed to create transaction"
        return { error: msg }
    }
}

export async function updateTransaction(formData: FormData) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    const rawData = {
        id: formData.get("id") as string,
        projectId: formData.get("projectId") as string,
        amount: formData.get("amount"),
        type: formData.get("type") as string,
        category: formData.get("category") as string,
        description: formData.get("description") as string | null,
        notes: formData.get("notes") as string | null,
        date: formData.get("date") as string | null,
    }

    try {
        const validatedData = updateTransactionSchema.parse(rawData)

        const existingTransaction = await prisma.transaction.findUnique({
            where: { id: validatedData.id }
        })

        if (!existingTransaction) {
            return { error: "Transaction not found" }
        }

        // Handle File Upload (Optional during update)
        const file = formData.get("receipt") as File | null
        let receiptPath = existingTransaction.receiptPath

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
            const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
            const uploadDir = join(process.cwd(), "public", "uploads")

            await mkdir(uploadDir, { recursive: true })

            const filepath = join(uploadDir, filename)
            await writeFile(filepath, buffer)

            receiptPath = `/uploads/${filename}`
        }

        let transactionDate = new Date()
        if (validatedData.date) {
            const parsedDate = new Date(validatedData.date)
            if (parsedDate.toString() !== "Invalid Date") {
                transactionDate = parsedDate
            }
        }

        await prisma.transaction.update({
            where: { id: validatedData.id },
            data: {
                amount: validatedData.amount,
                type: validatedData.type,
                category: validatedData.category,
                description: validatedData.description || "",
                notes: validatedData.notes,
                date: transactionDate,
                receiptPath: receiptPath,
            },
        })

        revalidatePath(`/projects/${validatedData.projectId}`)
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to update transaction:", error)
        if (error instanceof z.ZodError) {
            return { error: error.issues[0].message }
        }
        return { error: "Failed to update transaction" }
    }
}

export async function deleteTransaction(transactionId: string, projectId: string) {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.transaction.delete({
            where: { id: transactionId },
        })

        revalidatePath(`/projects/${projectId}`)
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete transaction:", error)
        return { error: "Failed to delete transaction" }
    }
}
