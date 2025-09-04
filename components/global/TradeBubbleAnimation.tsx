import React, { useEffect } from 'react'
import { useBubbleAnimation } from '../ExpBubble'

const TradeBubbleAnimation = ({
    handleCloseBubbleAnimation,
    targetId = 'wallet-button',
    originId,
}: {
    handleCloseBubbleAnimation: () => void
    targetId?: string
    originId?: string
}) => {
    const { spawnBubbles, BubbleAnimationComponent } = useBubbleAnimation(targetId)

    useEffect(() => {
        spawnBubbles(undefined, undefined, 10, originId, () => {
            //close when animation done
            handleCloseBubbleAnimation()
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <BubbleAnimationComponent />
        </>
    )
}

export default TradeBubbleAnimation
