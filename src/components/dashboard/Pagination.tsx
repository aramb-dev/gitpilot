import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
}

export function Pagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange
}: PaginationProps) {
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return (
        <div className="flex justify-end items-center space-x-4">
            <span className="text-sm text-gray-400">
                {startItem}-{endItem} of {totalItems}
            </span>
            <Button
                variant="ghost"
                size="sm"
                className="p-2"
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="p-2"
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <ChevronRight className="w-5 h-5" />
            </Button>
        </div>
    )
}
