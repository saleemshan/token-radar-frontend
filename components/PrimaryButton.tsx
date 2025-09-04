import Link from 'next/link'
import React, { FC, MouseEventHandler } from 'react'

interface PrimaryButtonProps {
    href?: string
    onClick?: MouseEventHandler<HTMLButtonElement>
    onMouseOver?: MouseEventHandler<HTMLButtonElement>
    onMouseEnter?: MouseEventHandler<HTMLButtonElement>
    onMouseLeave?: MouseEventHandler<HTMLButtonElement>
    children: React.ReactNode
    className?: string
}

const PrimaryButton: FC<PrimaryButtonProps> = ({ href, onClick, onMouseOver, onMouseEnter, onMouseLeave, children, className }) => {
    return (
        <div className={`relative overflow-hidden rounded-lg p-[1px] min-w-fit ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/20" />

            {href ? (
                <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative px-4  py-2 overflow-hidden bg-black rounded-lg group inline-flex"
                >
                    <div className="absolute bottom-0 w-full h-4 translate-x-1/2 rounded-lg right-1/2 bg-primary blur-lg" />
                    <div className="absolute inset-0 opacity-0 apply-transition bg-gradient-to-r from-primary/40 via-primary/70 to-primary/40 group-hover:opacity-100" />
                    <div className="relative text-xs font-medium tracking-widest text-red-100 uppercase group-hover:text-white apply-transition text-nowrap">
                        {children}
                    </div>
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={onClick}
                    onMouseOver={onMouseOver}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    className="relative px-5 py-2 overflow-hidden bg-black rounded-lg group inline-flex w-full"
                >
                    <div className="absolute bottom-0 w-full h-4 translate-x-1/2 rounded-md right-1/2 bg-primary blur-lg" />
                    <div className="absolute inset-0 opacity-0 apply-transition bg-gradient-to-r from-primary/40 via-primary/70 to-primary/40 group-hover:opacity-100" />
                    <div className="relative text-xs font-medium tracking-widest text-red-100 uppercase group-hover:text-white apply-transition text-nowrap text-center w-full">
                        {children}
                    </div>
                </button>
            )}
        </div>
    )
}

export default PrimaryButton
