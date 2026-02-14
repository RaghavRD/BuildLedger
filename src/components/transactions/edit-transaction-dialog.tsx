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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateTransaction } from "@/lib/actions/transactions"
import { toast } from "sonner"
import { Pencil } from "lucide-react"

const CATEGORIES = [
    "MATERIALS",
    "LABOR",
    "EQUIPMENT",
    "TRANSPORT",
    "PERMITS",
    "PAYMENT",
    "MISC",
]

interface EditTransactionDialogProps {
    transaction: {
        id: string
        projectId: string
        amount: number
        type: "DEBIT" | "CREDIT"
        category: string
        description: string | null
        notes: string | null
        date: Date | string
        receiptPath: string | null
    }
}

export function EditTransactionDialog({ transaction }: EditTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [txType, setTxType] = useState<"DEBIT" | "CREDIT">(transaction.type)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        formData.append("id", transaction.id)
        formData.append("projectId", transaction.projectId)
        formData.append("type", txType)

        const result = await updateTransaction(formData)

        setIsLoading(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Transaction updated successfully")
            setOpen(false)
        }
    }

    const formattedDate = new Date(transaction.date).toISOString().split('T')[0]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Transaction</DialogTitle>
                        <DialogDescription>
                            Update the details for this transaction.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">

                        {/* Transaction Type Radio */}
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold text-sm">Transaction Type</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <label
                                    className={`flex items-center justify-center gap-2 px-3 py-3 rounded-md border cursor-pointer transition-all ${txType === "DEBIT"
                                        ? "border-red-500 bg-red-50 text-red-700 shadow-sm ring-1 ring-red-500"
                                        : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="txTypeRadio"
                                        value="DEBIT"
                                        checked={txType === "DEBIT"}
                                        onChange={() => setTxType("DEBIT")}
                                        className="sr-only"
                                    />
                                    <div className={`h-3 w-3 rounded-full border-2 ${txType === "DEBIT" ? "border-red-500 bg-red-500" : "border-gray-400"
                                        }`} />
                                    <span className="text-sm font-bold uppercase tracking-tight">Debit</span>
                                </label>
                                <label
                                    className={`flex items-center justify-center gap-2 px-3 py-3 rounded-md border cursor-pointer transition-all ${txType === "CREDIT"
                                        ? "border-green-500 bg-green-50 text-green-700 shadow-sm ring-1 ring-green-500"
                                        : "border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="txTypeRadio"
                                        value="CREDIT"
                                        checked={txType === "CREDIT"}
                                        onChange={() => setTxType("CREDIT")}
                                        className="sr-only"
                                    />
                                    <div className={`h-3 w-3 rounded-full border-2 ${txType === "CREDIT" ? "border-green-500 bg-green-500" : "border-gray-400"
                                        }`} />
                                    <span className="text-sm font-bold uppercase tracking-tight">Credit</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="amount" className="sm:text-right font-semibold">
                                Amount
                            </Label>
                            <div className="sm:col-span-3 relative">
                                <span className="absolute left-3 top-2.5 sm:top-2 text-gray-500 text-sm">₹</span>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    defaultValue={transaction.amount}
                                    placeholder="0.00"
                                    className="pl-7 h-11 sm:h-9"
                                    required
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="category" className="sm:text-right font-semibold">
                                Category
                            </Label>
                            <Select name="category" required defaultValue={transaction.category}>
                                <SelectTrigger className="w-full sm:col-span-3 h-11 sm:h-9">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="date" className="sm:text-right font-semibold">
                                Date
                            </Label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                className="sm:col-span-3 h-11 sm:h-9"
                                defaultValue={formattedDate}
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
                                defaultValue={transaction.description || ""}
                                placeholder="What was purchased?"
                                className="sm:col-span-3 h-11 sm:h-9"
                            />
                        </div>

                        <div className="flex flex-col sm:grid sm:grid-cols-4 sm:items-center gap-2 sm:gap-4">
                            <Label htmlFor="receipt" className="sm:text-right font-semibold">
                                Receipt
                            </Label>
                            <div className="sm:col-span-3 space-y-2">
                                <Input
                                    id="receipt"
                                    name="receipt"
                                    type="file"
                                    accept="image/*,application/pdf"
                                    className="cursor-pointer h-11 sm:h-9 px-2 py-2"
                                />
                                {transaction.receiptPath && (
                                    <p className="text-[10px] text-muted-foreground italic truncate">
                                        Current: {transaction.receiptPath.split('/').pop()}
                                    </p>
                                )}
                            </div>
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
