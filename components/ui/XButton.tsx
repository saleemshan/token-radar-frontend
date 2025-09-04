'use client'
import React from 'react'
import { FaXmark } from 'react-icons/fa6'

const XButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button
            type="button"
            onClick={() => {
                onClick()
            }}
            className="flex bg-table-odd border border-border hover:bg-neutral-900 rounded-lg w-8 md:w-9 h-8 md:h-9 items-center justify-center text-neutral-text apply-transition text-base md:text-lg"
        >
            <FaXmark />
        </button>
    )
}

export default XButton
