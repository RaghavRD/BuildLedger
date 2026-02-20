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
import { deleteTransaction } from "@/lib/actions/transactions"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface DeleteTransactionDialogProps {
    transactionId: string
    projectId: string
}

export function DeleteTransactionDialog({ transactionId, projectId }: DeleteTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    async function handleDelete() {
        setIsLoading(true)
        const result = await deleteTransaction(transactionId, projectId)
        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Transaction deleted successfully")
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Delete Transaction">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Transaction</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this transaction? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? "Deleting..." : "Delete Transaction"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
