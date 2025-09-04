import React from 'react'
import { flexRender } from '@tanstack/react-table'
import { TableBodyProps } from './types'
import TextLoading from '../../TextLoading'

const TableBody = <T,>({ rows, loading, emptyMessage, className = '' }: TableBodyProps<T>) => {
    if (loading) {
        return (
            <tbody className={`w-full text-xs ${className}`}>
                <tr>
                    <td colSpan={100} className="text-center py-8">
                        <TextLoading />
                    </td>
                </tr>
            </tbody>
        )
    }

    if (!rows.length) {
        return (
            <tbody className={`w-full text-xs ${className}`}>
                <tr>
                    <td colSpan={100} className="text-center py-8 text-neutral-text-dark text-xs">
                        {emptyMessage}
                    </td>
                </tr>
            </tbody>
        )
    }

    return (
        <tbody className={`w-full text-xs ${className}`}>
            {rows.map(row => (
                <tr key={row.id} className="cursor-pointer border-b border-border/80 apply-transition relative bg-table-even hover:bg-table-odd">
                    {row.getVisibleCells().map(cell => (
                        <td
                            key={cell.id}
                            className={`
                text-left px-3 py-3 text-neutral-text text-xs
                ${cell.column.id === 'amount' ? 'text-right' : ''}
              `}
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    )
}

export default TableBody
