'use client'

import React, { useRef } from 'react'
import UnstakingQueueChart from '@/components/charts/UnstakingQueueChart'
import UnstakingQueueTable from '@/components/tables/UnstakingQueueTable'
import useControlledScroll from '@/hooks/useControlledScroll'

const UnstakingQueuePage = () => {
    const containerRef = useRef<HTMLDivElement>(null)

    useControlledScroll({ ref: containerRef })

    return (
        <div ref={containerRef} className="w-full flex-1 overflow-y-auto bg-black">
            <div className="max-w-7xl mx-auto flex flex-col gap-6 p-6">
                {/* Chart Section */}
                <section className="w-full">
                    <UnstakingQueueChart />
                </section>

                {/* Table Section */}
                <section className="w-full">
                    <UnstakingQueueTable pageSize={50} showTotalItems={true} className="w-full" />
                </section>
            </div>
        </div>
    )
}

export default UnstakingQueuePage
