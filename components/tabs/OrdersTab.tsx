import useControlledScroll from '@/hooks/useControlledScroll'
import React, { useRef, useState } from 'react'
import TableRowLoading from '../TableRowLoading'
import Image from 'next/image'
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { FaTrash } from 'react-icons/fa6'
import ConfirmationModal from '../modal/ConfirmationModal'

const OrdersTab = () => {
    const confirmationModalRef = useRef<{ toggleModal: () => void }>(null)
    const tableContainerRef = useRef<HTMLDivElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [targetOrder, setTargetOrder] = useState<any>(null)
    useControlledScroll({ ref: tableContainerRef })
    const [isTokenHoldingsLoading] = useState(false)

    const [activeTable, setActiveTable] = useState<'active' | 'history'>('active')

    return (
        <div className="flex flex-col min-h-[60vh] max-h-[60vh] relative ">
            <div className="flex items-center justify-between p-3">
                <div>Limit Orders</div>
                <div className="flex items-center bg-neutral-950 rounded-lg overflow-hidden p-1 border border-border">
                    <button
                        onClick={() => setActiveTable('active')}
                        type="button"
                        className={` p-1 px-2 rounded-md leading-none text-xs ${
                            activeTable === 'active'
                                ? 'bg-neutral-800 text-neutral-text'
                                : 'bg-neutral-950 text-neutral-text-dark hover:bg-neutral-900 transition-all duration-200 hover:text-neutral-text/80'
                        }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setActiveTable('history')}
                        type="button"
                        className={` p-1 px-2 rounded-md leading-none text-xs ${
                            activeTable === 'history'
                                ? 'bg-neutral-800 text-neutral-text'
                                : 'bg-neutral-950 text-neutral-text-dark hover:bg-neutral-900 transition-all duration-200 hover:text-neutral-text/80'
                        }`}
                    >
                        History
                    </button>
                </div>
            </div>
            <div ref={tableContainerRef} className="  overflow-x-auto mobile-no-scrollbar overflow-y-auto h-full">
                <table className=" table-auto w-full h-full ">
                    <thead className=" w-full sticky top-0 uppercase bg-black text-sm z-20">
                        <tr className="w-full text-neutral-text-dark relative">
                            <th className="py-3 text-xs px-2 text-nowrap  text-left">
                                You Pay
                                <div className="absolute inset-x-0 h-[1px] bg-border bottom-0"></div>
                                <div className="absolute inset-x-0 h-[1px] bg-border top-0"></div>
                            </th>
                            <th className="py-3 text-xs px-2 text-nowrap  text-left">You Receive</th>
                            <th className="py-3 text-xs px-2 text-nowrap  text-left">Order Rates</th>
                            <th className="py-3 text-xs px-2 text-nowrap  text-left">Creation/Expiration</th>
                            <th className="py-3 text-xs px-2 text-nowrap  text-left">Filled</th>
                            <th className="py-3 text-xs px-2 text-nowrap  text-left">{activeTable === 'active' ? 'Action' : 'Status'}</th>
                        </tr>
                    </thead>
                    {isTokenHoldingsLoading ? (
                        <TableRowLoading totalTableData={8} totalRow={15} className="px-2 items-center" />
                    ) : (
                        <tbody className="w-full text-xs">
                            {Array.from({ length: 10 }).map((_, index) => {
                                return (
                                    <tr
                                        key={index}
                                        className="bg-table-even  border-b border-border/80 apply-transition relative text-xs   hover:bg-table-odd"
                                    >
                                        <td>
                                            <div className="flex items-center p-2 gap-2">
                                                <div className="size-10 border border-border rounded-full overflow-hidden">
                                                    <Image
                                                        src={TOKEN_PLACEHOLDER_IMAGE}
                                                        alt="placeholder"
                                                        width={100}
                                                        height={100}
                                                        className=" w-full h-full object-cover object-center"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className=" leading-none">SOL</div>
                                                    <div className=" leading-none">0.0512345</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center p-2 gap-2">
                                                <div className="size-10 border border-border rounded-full overflow-hidden">
                                                    <Image
                                                        src={TOKEN_PLACEHOLDER_IMAGE}
                                                        alt="placeholder"
                                                        width={100}
                                                        height={100}
                                                        className=" w-full h-full object-cover object-center"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className=" leading-none">PNUT</div>
                                                    <div className=" leading-none">0.0512345</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex p-2 flex-col gap-1">
                                                <div className=" leading-none">1 SOL = 559.944767 PNUT</div>
                                                <div className=" leading-none">1 PNUT = 0.00178589 SOL</div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="flex p-2 flex-col gap-1">
                                                <div className=" leading-none">30 Nov 2024 14:01</div>
                                                <div className=" leading-none">30 Nov 2024 14:03</div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex p-2">5%</div>
                                        </td>
                                        <td>
                                            {activeTable === 'active' ? (
                                                <div className="flex items-center p-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setTargetOrder(index)

                                                            if (confirmationModalRef) confirmationModalRef.current?.toggleModal()
                                                        }}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex p-2">Done</div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    )}
                </table>
            </div>

            <ConfirmationModal
                header="Cancel Order"
                content={`Are you sure you want to cancel ${targetOrder} limit order?`}
                type="danger"
                ref={confirmationModalRef}
                action={() => {}}
            ></ConfirmationModal>
        </div>
    )
}

export default OrdersTab
