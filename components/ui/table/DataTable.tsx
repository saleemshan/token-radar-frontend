import React, { useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    SortingState,
    PaginationState,
} from '@tanstack/react-table'
import { TableProps } from './types'
import TableHeader from './TableHeader'
import TableBody from './TableBody'
import TablePagination from './TablePagination'

const DataTable = <T,>({
    data,
    columns,
    loading = false,
    error,
    enableSorting = true,
    enablePagination = true,
    enableFiltering = false,
    pageSize = 50,
    pageSizeOptions = [25, 50, 100, 200],
    emptyMessage = 'No data available',
    className = '',
    onSortingChange,
    onPaginationChange,
    initialSorting = [],
    initialPagination = { pageIndex: 0, pageSize },
}: TableProps<T>) => {
    const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
    const [pagination, setPagination] = React.useState<PaginationState>(initialPagination)

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
        },
        onSortingChange: updater => {
            const newSorting = typeof updater === 'function' ? updater(sorting) : updater
            setSorting(newSorting)
            onSortingChange?.(newSorting)
        },
        onPaginationChange: updater => {
            const newPagination = typeof updater === 'function' ? updater(pagination) : updater
            setPagination(newPagination)
            onPaginationChange?.(newPagination)
        },
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
        getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
        manualSorting: false,
        manualPagination: false,
    })

    const paginationProps = useMemo(
        () => ({
            currentPage: table.getState().pagination.pageIndex + 1,
            totalPages: table.getPageCount(),
            pageSize: table.getState().pagination.pageSize,
            totalItems: table.getFilteredRowModel().rows.length,
            pageSizeOptions,
            onPageChange: (page: number) => table.setPageIndex(page - 1),
            onPageSizeChange: (size: number) => table.setPageSize(size),
            canPreviousPage: table.getCanPreviousPage(),
            canNextPage: table.getCanNextPage(),
        }),
        [table, pageSizeOptions]
    )

    if (error) {
        return (
            <div className={`flex flex-col border border-border rounded-lg bg-black overflow-hidden ${className}`}>
                <div className="flex items-center justify-center py-8 text-negative text-xs">Error loading data: {error.message}</div>
            </div>
        )
    }

    return (
        <div className={`flex flex-col border border-border rounded-lg bg-black overflow-hidden ${className}`}>
            <div className="flex-1 overflow-hidden">
                <div className="h-full max-h-[60vh] overflow-y-auto mobile-no-scrollbar">
                    <table className="table-auto w-full h-full relative">
                        <TableHeader headerGroups={table.getHeaderGroups()} enableSorting={enableSorting} />
                        <TableBody rows={table.getRowModel().rows} loading={loading} emptyMessage={emptyMessage} />
                    </table>
                </div>
            </div>

            {enablePagination && <TablePagination {...paginationProps} />}
        </div>
    )
}

export default DataTable
