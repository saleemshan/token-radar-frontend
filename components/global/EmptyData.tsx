import React from 'react'
import { ImFilesEmpty } from 'react-icons/im'

const EmptyData = ({ text = 'No Available Data', padding = 'py-12' }: { text?: string; padding?: string }) => {
    return (
        <div className={`flex flex-col items-center justify-center flex-1 p-3 gap-3 text-neutral-text-dark w-full ${padding}`}>
            <ImFilesEmpty className="text-[46px]" />
            <div className=" text-xs w-3/4 text-center">{text}</div>
        </div>
    )
}

export default EmptyData
