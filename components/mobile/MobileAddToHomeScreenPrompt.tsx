'use client'
import useAddToHomeScreenPrompt from '@/hooks/useAddToHomeScreenPrompt'
import React from 'react'
import { CgAddR } from 'react-icons/cg'
import { GoShare } from 'react-icons/go'

const MobileAddToHomeScreenPrompt = () => {
    const { promptVisible, isMobile, closePrompt, dontShowAgain } = useAddToHomeScreenPrompt()

    if (!promptVisible || !isMobile) return null
    return (
        <div className="fixed inset-0 text-neutral-text z-[1000] bg-black/10 backdrop-blur-sm  flex items-end pb-3 justify-center p-3">
            <div className="flex flex-col items-center gap-2 border border-border bg-table-odd rounded-lg p-3">
                <div className="flex flex-col ">
                    <p className="pb-2">Install the app on your device to have it easily accessible at any time.</p>
                    <div className="flex items-center gap-2">
                        <span>1. Click on</span>
                        <GoShare />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>2. Choose Add to Home Screen</span>
                        <CgAddR />
                    </div>
                </div>
                <div className="flex w-full items-center gap-2 pt-2">
                    <button
                        type="button"
                        onClick={closePrompt}
                        className=" flex-1  bg-neutral-900 hover:bg-neutral-800 font-semibold text-neutral-text apply-transition py-3 rounded-lg w-full text-xs hover:text-neutral-text"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={dontShowAgain}
                        className=" flex-1  bg-neutral-900 hover:bg-neutral-800 font-semibold text-neutral-text apply-transition py-3 rounded-lg w-full text-xs hover:text-neutral-text"
                    >
                        {`Don't Show Again`}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MobileAddToHomeScreenPrompt
