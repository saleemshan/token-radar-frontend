import React from 'react'

interface InputProps {
    inputSymbol?: React.ReactNode
    placeholder?: string
    value?: string | undefined
    className?: string
    type?: string
    readOnly?: boolean
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const Input: React.FC<InputProps> = ({ inputSymbol, placeholder, value, onChange, type = 'text', className = 'w-full h-10', readOnly }) => {
    return (
        <div className={`relative overflow-hidden rounded-lg border focus:border-border border-border ${className}`}>
            {inputSymbol && (
                <div className="absolute inset-y-0 flex justify-center items-center px-3 border-r border-border bg-table-odd text-base w-10 min-w-10">
                    {inputSymbol}
                </div>
            )}
            <input
                readOnly={readOnly}
                type={type}
                className={`w-full h-full rounded-lg p-2 focus:outline-none text-neutral-text bg-table-odd text-base focus:bg-neutral-900 ${
                    inputSymbol ? 'pl-12' : ''
                }`}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                aria-label={placeholder} // Accessibility consideration
            />
        </div>
    )
}

export default Input
