import { ColumnDef, SortingState, PaginationState, HeaderGroup, Row } from '@tanstack/react-table'

export interface TableConfig<T> {
    data: T[]
    columns: ColumnDef<T>[]
    loading?: boolean
    error?: Error | null
    enableSorting?: boolean
    enablePagination?: boolean
    enableFiltering?: boolean
    pageSize?: number
    pageSizeOptions?: number[]
    emptyMessage?: string
    className?: string
}

export interface TablePaginationProps {
    currentPage: number
    totalPages: number
    pageSize: number
    totalItems: number
    pageSizeOptions: number[]
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    canPreviousPage: boolean
    canNextPage: boolean
    className?: string
}

export interface TableHeaderProps<T> {
    headerGroups: HeaderGroup<T>[]
    enableSorting: boolean
    className?: string
}

export interface TableBodyProps<T> {
    rows: Row<T>[]
    loading: boolean
    emptyMessage: string
    className?: string
}

export interface TableProps<T> extends TableConfig<T> {
    onSortingChange?: (sorting: SortingState) => void
    onPaginationChange?: (pagination: PaginationState) => void
    initialSorting?: SortingState
    initialPagination?: PaginationState
}
