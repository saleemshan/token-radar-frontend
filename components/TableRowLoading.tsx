import React from 'react'

const TableRowLoading = ({ totalTableData, totalRow, className }: { totalTableData: number; totalRow: number; className?: string }) => {
    return (
        <tbody className="w-full text-xs">
            {Array.from({ length: totalRow }).map((_, index) => {
                return (
                    <tr key={index} className="animate-pulse ">
                        {Array.from({ length: totalTableData }).map((_, index) => (
                            <td key={index} className="">
                                <div role="status" className={`flex flex-col justify-center py-2 ${className}`}>
                                    <div className="h-[.5rem] bg-border rounded-full w-[40%]"></div>
                                </div>
                            </td>
                        ))}
                    </tr>
                )
            })}
        </tbody>
    )
}

export default TableRowLoading
