/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ReactNode } from 'react'
import { FaChevronDown } from 'react-icons/fa6'

interface DropdownProps {
    placeholder: string
    options: { label: ReactNode | string; value: any }[]
    selectedOption: { label: ReactNode | string; value: any } | undefined
    onChange: (selected: { label: ReactNode | string; value: any }) => void
}

const Dropdown: React.FC<DropdownProps> = ({ options, selectedOption, onChange, placeholder }) => {
    const [showTokenOption, setShowTokenOption] = useState(false)

    return (
        <div className="relative w-full">
            <button
                className={`relative overflow-hidden w-full h-10 flex text-sm items-center bg-table-odd hover:bg-neutral-900 border border-border rounded-lg px-2 ${
                    selectedOption ? '' : 'text-neutral-300'
                }`}
                onClick={() => {
                    setShowTokenOption(!showTokenOption)
                }}
            >
                {selectedOption ? (
                    <div className="flex items-center gap-3 w-full">
                        <div className="text-left">{selectedOption.label}</div>

                        <FaChevronDown className={`text-neutral-300 text-2xs ml-auto ${showTokenOption ? 'rotate-180' : ''}`} />
                    </div>
                ) : (
                    <div className="flex items-center gap-3 w-full">
                        <div>{placeholder}</div>
                        <FaChevronDown className={`text-neutral-300 text-2xs ml-auto ${showTokenOption ? 'rotate-180' : ''}`} />
                    </div>
                )}
            </button>
            {showTokenOption && (
                <div className="flex flex-col absolute bg-table-even w-full top-11 border text-xs border-border rounded-lg z-50 max-h-[20vh] overflow-y-auto">
                    {options.map((data, index) => (
                        <button
                            key={`${data}-${index}`}
                            onClick={() => {
                                onChange(data)
                                setShowTokenOption(false)
                            }}
                            className="p-2 hover:bg-table-odd apply-transition"
                        >
                            <div className="flex items-center gap-3 text-left">{data.label}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Dropdown
