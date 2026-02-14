"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"

export function ExportButton({ projectId }: { projectId: string }) {
    const handleExport = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/export`)

            if (!response.ok) {
                throw new Error("Failed to export data")
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `project-${projectId}-transactions.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success("Export started")
        } catch (error) {
            toast.error("Failed to export transactions")
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleExport} className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-8">
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="whitespace-nowrap">Export CSV</span>
        </Button>
    )
}
