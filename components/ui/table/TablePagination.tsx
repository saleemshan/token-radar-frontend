import React from 'react'
import Button from '../Button'
import { TablePaginationProps } from './types'

const TablePagination: React.FC<TablePaginationProps> = ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    pageSizeOptions,
    onPageChange,
    onPageSizeChange,
    canPreviousPage,
    canNextPage,
    className = '',
}) => {
    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    if (totalPages <= 1) return null

    return (
        <div className={`flex items-center justify-between px-4 py-3 bg-neutral-800/30 border-t border-border ${className}`}>
            {/* Items count display */}
            <div className="text-sm text-neutral-text-dark">
                Showing {startItem.toLocaleString()} to {endItem.toLocaleString()} of {totalItems.toLocaleString()} entries
            </div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-2">
                <Button
                    onClick={() => onPageChange(1)}
                    disabled={!canPreviousPage}
                    variant="ghost"
                    className="px-3 py-1 text-sm min-h-8 h-8"
                    uppercase={false}
                >
                    First
                </Button>

                <Button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={!canPreviousPage}
                    variant="ghost"
                    className="px-3 py-1 text-sm min-h-8 h-8"
                    uppercase={false}
                >
                    Previous
                </Button>

                <span className="px-3 py-1 text-sm text-neutral-text">
                    Page {currentPage} of {totalPages}
                </span>

                <Button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!canNextPage}
                    variant="ghost"
                    className="px-3 py-1 text-sm min-h-8 h-8"
                    uppercase={false}
                >
                    Next
                </Button>

                <Button
                    onClick={() => onPageChange(totalPages)}
                    disabled={!canNextPage}
                    variant="ghost"
                    className="px-3 py-1 text-sm min-h-8 h-8"
                    uppercase={false}
                >
                    Last
                </Button>
            </div>

            {/* Page size selector */}
            <select
                value={pageSize}
                onChange={e => onPageSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-sm bg-neutral-900 text-neutral-text rounded border border-border focus:outline-none focus:border-primary"
            >
                {pageSizeOptions.map(size => (
                    <option key={size} value={size}>
                        {size} per page
                    </option>
                ))}
            </select>
        </div>
    )
}

export default TablePagination
