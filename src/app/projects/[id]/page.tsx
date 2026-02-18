import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { getProjectById } from "@/lib/actions/projects"
import { DashboardHeader } from "@/components/dashboard/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreateTransactionDialog } from "@/components/transactions/create-transaction-dialog"
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog"
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog"
import { EditProjectDialog } from "@/components/projects/edit-project-dialog"
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog"
import { ExportButton } from "@/components/projects/export-button"
import { InviteUserDialog } from "@/components/projects/invite-user-dialog"
import { MemberList } from "@/components/projects/member-list"
import Link from "next/link"
import { FileText, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 10

export default async function ProjectDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ page?: string }>
}) {
    const session = await getServerSession(authOptions)

    if (!session) {
        redirect("/login")
    }

    const { id } = await params
    const { page } = await searchParams
    const currentPage = Math.max(1, parseInt(page || "1", 10))

    const project = await getProjectById(id)

    if (!project) {
        notFound()
    }

    const isAdmin = session.user.role === "ADMIN"

    // Calculate totals: DEBIT subtracts, CREDIT adds back
    const totalDebit = project.transactions
        .filter((t: any) => t.type !== "CREDIT")
        .reduce((acc: number, t: any) => acc + t.amount, 0)
    const totalCredit = project.transactions
        .filter((t: any) => t.type === "CREDIT")
        .reduce((acc: number, t: any) => acc + t.amount, 0)

    // Total Spend card: Show summation of all debits
    const totalSpendDisplay = totalDebit

    // Remaining Budget: Initial Budget - Credits (As requested)
    const cardRemainingBudget = project.budget - totalCredit

    // Profit logic: Remaining Budget - Total Spend
    const currentProfit = cardRemainingBudget - totalDebit

    const percentUsed = project.budget > 0 ? Math.min(Math.round((totalDebit / project.budget) * 100), 100) : 0

    // Pagination
    const totalTransactions = project.transactions.length
    const totalPages = Math.max(1, Math.ceil(totalTransactions / PAGE_SIZE))
    const safePage = Math.min(currentPage, totalPages)
    const startIndex = (safePage - 1) * PAGE_SIZE
    const paginatedTransactions = project.transactions.slice(startIndex, startIndex + PAGE_SIZE)

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
    })

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:p-8">
            <div className="mx-auto max-w-7xl">
                <DashboardHeader user={session.user} />

                <div className="mb-6">
                    <Link href="/dashboard" className="text-xs sm:text-sm text-muted-foreground hover:underline mb-3 inline-flex items-center gap-1 group">
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate tracking-tight">{project.name}</h1>
                                <Badge className={`${project.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' :
                                    project.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                        'bg-yellow-100 text-yellow-700 border-yellow-200'
                                    } capitalize text-[10px] sm:text-xs py-0 h-5 sm:h-6 px-2 border`}>
                                    {project.status.toLowerCase().replace('_', ' ')}
                                </Badge>
                            </div>
                            <p className="text-gray-500 mt-0.5 text-xs sm:text-base line-clamp-2 sm:line-clamp-none">{project.description || "No description"}</p>
                            {(project.startDate || project.endDate) && (
                                <p className="text-[10px] sm:text-sm text-gray-400 mt-1 flex items-center gap-1">
                                    <span className="font-medium">Timeline:</span>
                                    {project.startDate ? new Date(project.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Not started"}
                                    {" — "}
                                    {project.endDate ? new Date(project.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "Ongoing"}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 pt-2 sm:pt-0">
                            <Badge variant="outline" className="w-full xs:w-auto justify-center text-xs sm:text-lg py-1.5 px-3 bg-white border-blue-100 text-blue-700 font-bold shadow-sm">
                                Budget: {formatter.format(project.budget)}
                            </Badge>
                            {isAdmin && (
                                <div className="w-full xs:w-auto flex justify-end items-center gap-2">
                                    <EditProjectDialog
                                        project={{
                                            id: project.id,
                                            name: project.name,
                                            description: project.description,
                                            budget: project.budget,
                                            startDate: project.startDate,
                                            endDate: project.endDate,
                                            status: project.status,
                                        }}
                                    />
                                    <DeleteProjectDialog
                                        projectId={project.id}
                                        projectName={project.name}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
                    <Card className="xs:col-span-1 lg:col-span-1 border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Spend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl sm:text-3xl font-bold text-red-600">{formatter.format(totalSpendDisplay)}</div>
                            <div className="mt-4">
                                <div className="flex flex-col xs:flex-row xs:items-center justify-between text-[10px] sm:text-xs mb-2 font-medium text-gray-500 gap-1 xs:gap-2">
                                    <span className="shrink-0">{percentUsed}% budget used</span>
                                    <span className="break-words">{formatter.format(totalSpendDisplay)} / {formatter.format(project.budget)}</span>
                                </div>
                                <Progress value={percentUsed} className="h-2 sm:h-2.5 bg-gray-100" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="xs:col-span-1 lg:col-span-1 border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Rem. Budget</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl sm:text-3xl font-bold ${cardRemainingBudget < 0 ? "text-red-500" : "text-green-600"}`}>
                                {cardRemainingBudget >= 0 ? "+" : ""}{formatter.format(cardRemainingBudget)}
                            </div>
                            <div className={`mt-2 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-full inline-block ${currentProfit >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                {currentProfit >= 0 ? "Potential Profit" : "Current Loss"}: {formatter.format(Math.abs(currentProfit))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="xs:col-span-2 lg:col-span-1 border-none shadow-sm bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Transactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalTransactions}</div>
                            <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-tight font-medium outline-offset-1">Record history</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Transactions */}
                    <div className="lg:col-span-2 order-2 lg:order-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 px-1">
                            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 border-none">Transactions</h2>
                            <div className="flex flex-col xs:flex-row sm:items-center gap-2">
                                <div className="w-full xs:w-auto xs:flex-1 sm:flex-none">
                                    <ExportButton projectId={project.id} />
                                </div>
                                <div className="w-full xs:w-auto xs:flex-1 sm:flex-none">
                                    <CreateTransactionDialog projectId={project.id} />
                                </div>
                            </div>
                        </div>

                        <Card>
                            <CardContent className="p-0">
                                {totalTransactions === 0 ? (
                                    <div className="text-center py-12 px-4">
                                        <p className="text-muted-foreground">No transactions recorded yet.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="divide-y">
                                            {paginatedTransactions.map((tx: any) => (
                                                <div key={tx.id} className="group p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 transition-colors border-l-2 border-transparent hover:border-blue-500">
                                                    <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                                                        <div className="shrink-0 flex flex-col items-center">
                                                            <p className="font-bold text-[10px] sm:text-xs text-blue-600 uppercase tracking-tight">
                                                                {new Date(tx.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                                            </p>
                                                            <div className="h-4 sm:h-5 w-[1px] bg-gray-200 my-1" />
                                                            <div className={`h-2 w-2 rounded-full ${tx.type === "CREDIT" ? "bg-green-500" : "bg-red-500"}`} />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <p className="font-semibold text-sm sm:text-base text-gray-900 break-words whitespace-normal">
                                                                    {tx.description || tx.category}
                                                                </p>
                                                                <Badge variant="outline" className="text-[9px] sm:text-[10px] leading-none py-0.5 px-1.5 h-auto bg-gray-50 text-gray-600 border-gray-200 shrink-0">
                                                                    {tx.category}
                                                                </Badge>
                                                            </div>
                                                            {tx.notes && (
                                                                <p className="text-[11px] sm:text-sm text-gray-500 mt-1 whitespace-normal break-words italic">{tx.notes}</p>
                                                            )}
                                                            {tx.receiptPath && (
                                                                <a
                                                                    href={tx.receiptPath}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center text-[10px] sm:text-xs text-blue-600 font-medium hover:underline mt-1.5 bg-blue-50 px-2 py-0.5 rounded"
                                                                >
                                                                    <FileText className="h-3 w-3 mr-1" /> View Receipt
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-x-2 gap-y-3 pt-3 sm:pt-0 sm:pl-4 border-t sm:border-t-0 border-gray-100 mt-2 sm:mt-0">
                                                        <div className="text-left sm:text-right min-w-[100px] flex-1 sm:flex-none">
                                                            <p className={`font-bold text-base sm:text-lg tracking-tight ${tx.type === "CREDIT" ? "text-green-600" : "text-red-600"}`}>
                                                                {tx.type === "CREDIT" ? "+" : "-"}{formatter.format(tx.amount)}
                                                            </p>
                                                            <p className="text-[10px] sm:text-xs text-gray-400 font-medium truncate max-w-[120px] sm:max-w-none">
                                                                By {tx.createdBy.name.split(' ')[0]}
                                                            </p>
                                                        </div>
                                                        {isAdmin && (
                                                            <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform sm:translate-x-2 sm:group-hover:translate-x-0 shrink-0">
                                                                <EditTransactionDialog transaction={tx} />
                                                                <DeleteTransactionDialog transactionId={tx.id} projectId={id} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between border-t px-4 py-3">
                                                <p className="text-sm text-gray-500">
                                                    Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, totalTransactions)} of {totalTransactions}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {safePage > 1 ? (
                                                        <Link href={`/projects/${id}?page=${safePage - 1}`}>
                                                            <Button variant="outline" size="sm">
                                                                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button variant="outline" size="sm" disabled>
                                                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                                        </Button>
                                                    )}
                                                    <span className="text-sm font-medium px-2">
                                                        {safePage} / {totalPages}
                                                    </span>
                                                    {safePage < totalPages ? (
                                                        <Link href={`/projects/${id}?page=${safePage + 1}`}>
                                                            <Button variant="outline" size="sm">
                                                                Next <ChevronRight className="h-4 w-4 ml-1" />
                                                            </Button>
                                                        </Link>
                                                    ) : (
                                                        <Button variant="outline" size="sm" disabled>
                                                            Next <ChevronRight className="h-4 w-4 ml-1" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Team Members */}
                    <div className="order-1 lg:order-2">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 px-1">
                            <h2 className="text-base sm:text-lg font-bold tracking-tight text-gray-900">Team Members</h2>
                            <div className="sm:flex-none">
                                <InviteUserDialog projectId={project.id} />
                            </div>
                        </div>
                        <Card className="border-none shadow-sm bg-white">
                            <CardContent className="p-2 sm:p-4">
                                <MemberList
                                    members={project.members}
                                    projectId={project.id}
                                    ownerId={project.ownerId}
                                    isAdmin={isAdmin}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
