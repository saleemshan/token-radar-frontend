'use client'
import WalletPanel from '@/components/panel/WalletPanel'
import usePreventZoomOnMobile from '@/hooks/usePreventMobileZoom'
import React, { useState } from 'react'

const WalletPage = () => {
    usePreventZoomOnMobile()
    const [showWalletPanel, setShowWalletPanel] = useState(true)
    return (
        <>
            {/* <div className="w-full md:w-auto h-full overflow-hidden min-h-screen max-h-screen flex flex-col"> */}
            <div className="flex-1 min-h-full max-w-full overflow-hidden flex flex-col">
                {showWalletPanel && <WalletPanel setShowWalletPanel={setShowWalletPanel} />}
            </div>
        </>
    )
}

export default WalletPage
