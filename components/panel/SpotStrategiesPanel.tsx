import React, { useEffect, useRef, useState } from 'react'

import clsx from 'clsx'
import { toast } from 'react-toastify'
import { FaHistory } from 'react-icons/fa'
import { useLogin, usePrivy } from '@privy-io/react-auth'
import { FaArrowLeft, FaArrowRight, FaPencil, FaPlus, FaTrash } from 'react-icons/fa6'

import Tag from '../Tag'
import TextLoading from '../TextLoading'
import ConfirmationModal from '../modal/ConfirmationModal'
import StrategyLogsModal from '../modal/StrategyLogsModal'
import NewStrategyModal from '../modal/NewStrategyModal'
import useAtsData, { useMutateDeleteATS } from '@/hooks/data/useAtsData'
import EmptyData from '../global/EmptyData'
// import ExploreStrategiesModal from '../modal/ExploreStrategiesModal'

const SpotStrategiesPanel = ({
    showTabs = true,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setShowStrategyPanel,
}: {
    showTabs?: boolean
    setShowStrategyPanel: (show: boolean) => void
}) => {
    const { authenticated, ready } = usePrivy()
    const { login: handleSignIn } = useLogin()
    const { mutate: deleteAts, isSuccess: deleteAtsIsSuccess } = useMutateDeleteATS()

    // const exploreStrategiesModalRef = useRef<{ toggleModal: () => void; show: boolean }>(null)
    const confirmationModalRef = useRef<{ toggleModal: () => void; show: boolean }>(null)
    const strategyLogsModalRef = useRef<{
        toggleModal: (id: string, title: string) => void
    }>(null)
    const newStrategyModalRef = useRef<{
        toggleModal: (isEdit: boolean, item?: Strategy) => void
    }>(null)

    const [targetDeleteNewsStrategy, setTargetDeleteNewsStrategy] = useState<Strategy>()
    const [page, setPage] = useState(1)
    const [limit] = useState(40)

    // Existing useEffect to load strategies, add this line within that block
    const [totalPages, setTotalPages] = useState(1)

    // Add handlers for page navigation
    const handleNextPage = () => {
        if (page < totalPages) setPage(page + 1)
    }

    const handlePreviousPage = () => {
        if (page > 1) setPage(page - 1)
    }

    const { data, isLoading } = useAtsData(page, limit, false)

    const tabs = ['Strategies']
    const [activeTab, setActiveTab] = useState(tabs[0])

    useEffect(() => {
        if (data) {
            setTotalPages(data.pagination.totalPages ?? 1)
        }
    }, [data])

    const handleDeleteStrategy = () => {
        if (targetDeleteNewsStrategy) {
            if (process.env.NODE_ENV === 'development') console.log('deleting ats', targetDeleteNewsStrategy)

            deleteAts({ strategyId: targetDeleteNewsStrategy.strategyId, isPerps: false })
        }
    }

    useEffect(() => {
        if (deleteAtsIsSuccess) {
            toast.success('Automated trading strategy successfully deleted.', {
                autoClose: 10000,
            })

            // if (confirmationModalRef) confirmationModalRef.current?.toggleModal()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deleteAtsIsSuccess])

    return (
        <>
            <div
                id="news-strategies-panel"
                className={`relative z-[101] w-full  min-h-[50vh]  flex flex-col  pointer-events-auto  border-border  bg-black overflow-hidden flex-1`}
            >
                <div className="text-sm w-full font-semibold leading-6 text-white min-h-fit flex items-center gap-2 p-2 border-b border-border justify-between">
                    {showTabs && (
                        <div className=" items-center gap-2 flex w-full">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar  border-border ">
                                {tabs.map(tab => {
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => {
                                                setActiveTab(tab)
                                            }}
                                            className={clsx(
                                                ' flex text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-800 duration-200 transition-all  px-2 rounded-md font-semibold',
                                                activeTab === tab ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
                                            )}
                                        >
                                            {tab}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {ready && authenticated && (
                        <div className="flex items-center gap-2 ml-auto">
                            {/* <button
                                className={`flex  bg-table-odd border border-border rounded-lg  px-2 gap-1 h-8  min-h-8  md:h-6  md:min-h-6 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text`}
                                onClick={() => {
                                    // setShowStrategyPanel(false)
                                    exploreStrategiesModalRef.current?.toggleModal()
                                }}
                            >
                                <FaGlobe className="text-xs" />
                                <span className="text-xs">Explore Strategies</span>
                            </button> */}
                            <button
                                type="button"
                                onClick={() => {
                                    newStrategyModalRef.current?.toggleModal(false, undefined)
                                }}
                                className={`flex  bg-table-odd border border-border rounded-lg  px-2 gap-1  h-8  min-h-8  md:h-6  md:min-h-6 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text`}
                            >
                                <FaPlus className="text-xs" />
                                <span className="text-xs">Create</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 flex flex-col overflow-hidden h-full max-h-full relative">
                    {ready && authenticated ? (
                        <>
                            {activeTab === 'Strategies' && (
                                <div className="max-h-full h-full overflow-y-auto divide-y divide-border flex flex-col  relative">
                                    {isLoading ? (
                                        <>
                                            {Array.from({ length: 12 }).map((_, index) => {
                                                return (
                                                    <div
                                                        key={index}
                                                        className="col-span-full flex flex-col   items-left justify-start p-2 bg-table-odd even:bg-table-even animate-pulse min-h-fit"
                                                    >
                                                        <TextLoading className="min-w-full min-h-2" />
                                                        <TextLoading className="w-1/3 min-h-2" />
                                                    </div>
                                                )
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            {data && data.strategies && data.strategies.length > 0 ? (
                                                data.strategies.map((item, index) => {
                                                    return (
                                                        <div
                                                            key={`${item.id}-${index}`}
                                                            className={`min-h-fit apply-transition flex flex-col  bg-table-odd even:bg-table-even news-item`}
                                                        >
                                                            <div className="group flex flex-col p-2 pr-6 gap-2 w-full border-b border-border  break-words text-xs text-neutral-text/80 relative">
                                                                <div className="w-full ">{item.strategyName}</div>

                                                                <div className="flex items-center gap-2">
                                                                    {item.hasExecuted ? (
                                                                        <Tag variant="neutral">Completed</Tag>
                                                                    ) : (
                                                                        <>
                                                                            {item.isRunning ? (
                                                                                <Tag variant="positive">Active</Tag>
                                                                            ) : (
                                                                                <Tag variant="neutral">Inactive</Tag>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <div className="flex md:group-hover:flex md:hidden items-center absolute top-2 right-2 gap-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            strategyLogsModalRef.current?.toggleModal(
                                                                                item.strategyId,
                                                                                item.strategyName
                                                                            )
                                                                        }}
                                                                        type="button"
                                                                        className="  flex  bg-table-odd border border-border rounded-md items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text size-7 lg:w-5 lg:min-w-5 lg:h-5 lg:min-h-5"
                                                                    >
                                                                        <FaHistory className="text-2xs" />
                                                                    </button>

                                                                    {!item.hasExecuted && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => {
                                                                                    newStrategyModalRef.current?.toggleModal(true, item)
                                                                                }}
                                                                                type="button"
                                                                                className="  flex  bg-table-odd border border-border rounded-md items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text size-7 lg:w-5 lg:min-w-5 lg:h-5 lg:min-h-5"
                                                                            >
                                                                                <FaPencil className="text-2xs" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setTargetDeleteNewsStrategy(item)
                                                                                    confirmationModalRef.current?.toggleModal()

                                                                                    //trigger delete confirmation modal
                                                                                }}
                                                                                type="button"
                                                                                className="  flex  bg-table-odd border border-border rounded-md items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text size-7 lg:w-5 lg:min-w-5 lg:h-5 lg:min-h-5"
                                                                            >
                                                                                <FaTrash className="text-2xs" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <EmptyData text="No strategy found. Click on the plus button to create one." />
                                            )}
                                        </>
                                    )}

                                    <ConfirmationModal
                                        header="Delete Strategy"
                                        content={` Are you sure you want to delete "${targetDeleteNewsStrategy?.strategyName}" strategy?`}
                                        type="danger"
                                        ref={confirmationModalRef}
                                        action={handleDeleteStrategy}
                                    ></ConfirmationModal>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex-1 h-full flex items-center justify-center p-3 gap-1">
                                <button type="button" onClick={handleSignIn} className=" border-b border-white">
                                    Sign in
                                </button>
                                <span> to view the strategies.</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex justify-center p-2 items-center text-xs border-t border-border mb-4 md:mb-0">
                <button
                    onClick={handlePreviousPage}
                    disabled={page === 1}
                    className="flex  bg-table-odd border border-border cursor-pointer rounded-md w-5 min-w-5 h-5  min-h-5 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text "
                >
                    <FaArrowLeft />
                </button>

                <span className="mx-4 text-neutral-text-dark">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={page === totalPages}
                    className="flex  bg-table-odd border border-border cursor-pointer rounded-md w-5 min-w-5 h-5  min-h-5 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text "
                >
                    <FaArrowRight />
                </button>
            </div>

            {/* <ExploreStrategiesModal
                ref={exploreStrategiesModalRef}
                handleOpenCreateModal={() => {
                    newStrategyModalRef.current?.toggleModal(false, undefined)
                }}
            /> */}
            <NewStrategyModal ref={newStrategyModalRef} isPerps={false} />
            <StrategyLogsModal ref={strategyLogsModalRef} isPerps={false} />
        </>
    )
}

export default SpotStrategiesPanel
