import React from 'react'

interface NRSMomentumBarProps {
    vwpd: number
    total?: number
}

const NRSMomentumBar: React.FC<NRSMomentumBarProps> = ({ vwpd, total = 5 }) => {
    let redBubbles = 0
    if (vwpd < 5) redBubbles = 5
    else if (vwpd < 10) redBubbles = 4
    else if (vwpd < 15) redBubbles = 3
    else if (vwpd < 20) redBubbles = 2
    else if (vwpd < 30) redBubbles = 1
    else redBubbles = 0

    return (
        <div className="flex gap-1">
            {[...Array(total)].map((_, index) => (
                <div
                    key={index}
                    className={`
                        w-3 h-3 rounded-full transition-all duration-300
                        border border-white/30
                        ${index < redBubbles ? 'bg-negative shadow-[0_0_8px_red]' : 'bg-neutral-700 opacity-60 shadow-[0_0_4px_rgba(255,0,0,0.2)]'}
                        ${index === redBubbles - 1 && redBubbles > 0 ? 'animate-pulse-glow' : ''}
                        ${index >= redBubbles ? 'animate-flicker-flash' : ''}
                    `}
                />
            ))}
        </div>
    )
}

export default NRSMomentumBar
