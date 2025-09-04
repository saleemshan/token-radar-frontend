'use client'
import React, { useEffect, useState } from 'react'
import { getStatusColor } from '@/utils/streamingStatus'
import { FaArrowRotateRight } from 'react-icons/fa6'
import { getUppercaseFirstLetter } from '@/utils/string'

const TradingViewStatusIndicator = ({ className }: { className?: string }) => {
    const [streamingStatus, setStreamingStatus] = useState<TradingViewStreamingStatusEvent['status']>(undefined)

    useEffect(() => {
        const handleCustomStreamingStatusEvent = (event: CustomEvent<TradingViewStreamingStatusEvent>) => {
            // console.log(event.detail.status);

            setStreamingStatus(event.detail.status)
        }
        document.addEventListener('newTradingViewStreamingStatusEvent', handleCustomStreamingStatusEvent as EventListener)

        // Return a cleanup function to remove the event listener
        return () => {
            document.removeEventListener('newTradingViewStreamingStatusEvent', handleCustomStreamingStatusEvent as EventListener)
        }
    }, [])

    const handleResetChart = () => {
        setStreamingStatus(undefined)
        const statusEvent = new CustomEvent<{ reset: boolean }>('reInitializeChartEvent', {
            detail: {
                reset: true,
            },
        })

        document.dispatchEvent(statusEvent)
    }

    const goodStatus = ['online']

    return (
        <div className={` items-center gap-1  ${className ? className : 'flex'}`}>
            <div className="flex items-center gap-1 border border-border rounded-md px-1 relative h-4 min-h-4  bg-neutral-900 text-xs text-neutral-text">
                <span className=" flex  size-[6px] relative">
                    <span
                        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                        style={{ backgroundColor: getStatusColor(streamingStatus) }}
                    ></span>
                    <span
                        className="relative inline-flex size-[6px] rounded-full"
                        style={{ backgroundColor: getStatusColor(streamingStatus) }}
                    ></span>
                </span>
                <div className="text-[8px]" style={{ color: getStatusColor(streamingStatus) }}>
                    {getUppercaseFirstLetter(streamingStatus ?? '')}
                </div>
            </div>
            {!goodStatus.includes(streamingStatus?.toLowerCase() as string) && (
                <button
                    type="button"
                    className="flex  bg-table-odd border border-border text-xs rounded-md p-[3px] gap-2 w-4 min-w-4 h-4  min-h-4 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text-dark"
                    onClick={() => {
                        handleResetChart()
                    }}
                >
                    <FaArrowRotateRight />
                </button>
            )}
        </div>
    )
}

export default TradingViewStatusIndicator
