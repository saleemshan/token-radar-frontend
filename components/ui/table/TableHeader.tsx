import React from 'react'
import { flexRender } from '@tanstack/react-table'
import { IoArrowUpOutline } from 'react-icons/io5'
import { TableHeaderProps } from './types'

const TableHeader = <T,>({ headerGroups, enableSorting, className = '' }: TableHeaderProps<T>) => {
    return (
        <thead className={`w-full uppercase bg-black text-xs sticky top-0 z-20 ${className}`}>
            {headerGroups.map(headerGroup => (
                <tr key={headerGroup.id} className="w-full text-neutral-text-dark">
                    {headerGroup.headers.map(header => (
                        <th
                            key={header.id}
                            className={`
                py-3 text-xs px-3 text-left font-medium text-neutral-text-dark relative
                ${enableSorting && header.column.getCanSort() ? 'cursor-pointer select-none hover:text-neutral-text' : ''}
                ${header.column.id === 'amount' ? 'text-right' : ''}
              `}
                            onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
                            style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-neutral-text-dark">{flexRender(header.column.columnDef.header, header.getContext())}</span>

                                {enableSorting && header.column.getIsSorted() && (
                                    <IoArrowUpOutline
                                        className={`
                      w-3 h-3 text-neutral-text-dark transition-transform duration-200
                      ${header.column.getIsSorted() === 'desc' ? 'rotate-180' : ''}
                    `}
                                        aria-label={`Sorted ${header.column.getIsSorted() === 'desc' ? 'descending' : 'ascending'}`}
                                    />
                                )}

                                {enableSorting && header.column.getCanSort() && !header.column.getIsSorted() && (
                                    <IoArrowUpOutline className="w-3 h-3 text-neutral-text-dark opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                            </div>
                            <div className="h-[1px] w-full bg-border absolute inset-x-0 bottom-0"></div>
                        </th>
                    ))}
                </tr>
            ))}
        </thead>
    )
}

export default TableHeader
