import useIsMobile from '@/hooks/useIsMobile'
import React, { useState, useEffect, useRef, useCallback } from 'react'

interface Bubble {
    id: number
    x: number
    y: number
    size: number
    opacity: number
    velocityX: number
    velocityY: number
    absorbed: boolean
}

interface BubbleAnimationProps {
    targetSelector: string
    bubbleCount?: number
    className?: string
}

export function useBubbleAnimation(targetSelector: string) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [bubbles, setBubbles] = useState<Bubble[]>([])
    const [targetPosition, setTargetPosition] = useState<{
        x: number
        y: number
        width: number
        height: number
    } | null>(null)
    const bubbleIdRef = useRef(0)
    const animationFrameRef = useRef<number | null>(null)
    const lastBubbleAbsorbedRef = useRef<number>(0)
    const onCompleteCallbackRef = useRef<(() => void) | null>(null)
    const activeAnimationRef = useRef<boolean>(false)
    const bubblesRef = useRef<Bubble[]>([])
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const lastSoundPlayedRef = useRef<number>(0)
    const isMobile = useIsMobile()

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio('/sfx/ding.mp3')
        audioRef.current.volume = 0.3 // Set volume to 30%

        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
        }
    }, [])

    // Function to play sound with throttling
    const playAbsorptionSound = useCallback(() => {
        const now = Date.now()
        // Only play sound if it's been at least 100ms since the last sound
        if (now - lastSoundPlayedRef.current > 100 && audioRef.current) {
            // Clone the audio element to allow multiple overlapping sounds
            const sound = audioRef.current.cloneNode() as HTMLAudioElement
            sound.volume = 0.2
            sound.play().catch(e => console.log('Error playing sound:', e))

            // Clean up the cloned audio element after it finishes playing
            sound.onended = () => {
                sound.onended = null
            }

            lastSoundPlayedRef.current = now
        }
    }, [])

    // Keep a ref to the current bubbles to avoid dependency issues
    useEffect(() => {
        bubblesRef.current = bubbles
    }, [bubbles])

    const updateTargetPosition = useCallback(() => {
        const targetElement = document.getElementById(targetSelector)

        if (targetElement && containerRef.current) {
            const targetRect = targetElement.getBoundingClientRect()
            const containerRect = containerRef.current.getBoundingClientRect()

            setTargetPosition({
                x: targetRect.left - containerRect.left,
                y: targetRect.top - containerRect.top,
                width: targetRect.width,
                height: targetRect.height,
            })
        }
    }, [targetSelector])

    useEffect(() => {
        updateTargetPosition()
        const intervalId = setInterval(updateTargetPosition, 100) // Update position regularly
        window.addEventListener('resize', updateTargetPosition)

        return () => {
            clearInterval(intervalId)
            window.removeEventListener('resize', updateTargetPosition)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }
        }
    }, [updateTargetPosition])

    const cleanupAnimation = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
        }
        setBubbles([])
        activeAnimationRef.current = false
    }, [])

    const animateBubbles = useCallback(() => {
        if (!targetPosition) {
            updateTargetPosition()
            animationFrameRef.current = requestAnimationFrame(animateBubbles)
            return
        }

        const currentBubbles = bubblesRef.current
        // let absorbedCount = 0;
        const totalBubbles = currentBubbles.length
        let newlyAbsorbedCount = 0

        if (totalBubbles === 0) {
            activeAnimationRef.current = false
            return
        }

        const updatedBubbles = currentBubbles
            .map(bubble => {
                // If bubble is already being absorbed, continue the absorption animation
                if (bubble.absorbed) {
                    // absorbedCount++;
                    return {
                        ...bubble,
                        opacity: bubble.opacity - 0.15, // Fade out faster
                        size: bubble.size - 0.8, // Shrink faster
                    }
                }

                // Calculate center of the target
                const targetCenterX = targetPosition.x + targetPosition.width / 2
                const targetCenterY = targetPosition.y + targetPosition.height / 2

                // Calculate direction vector to target
                const dx = targetCenterX - bubble.x
                const dy = targetCenterY - bubble.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                // Determine if the bubble is close enough to be absorbed
                // For small targets, increase the absorption radius
                const absorptionRadius = Math.max(20, Math.min(targetPosition.width, targetPosition.height) / 2)
                const shouldAbsorb = distance < absorptionRadius

                if (shouldAbsorb) {
                    // Play absorption effect - bubble is now being absorbed
                    // absorbedCount++;
                    newlyAbsorbedCount++
                    return {
                        ...bubble,
                        absorbed: true,
                        // Snap to the target center for a cleaner absorption effect
                        x: targetCenterX,
                        y: targetCenterY,
                        velocityX: 0,
                        velocityY: 0,
                    }
                }

                // Normalize direction and apply acceleration
                const dirX = dx / (distance || 1) // Avoid division by zero
                const dirY = dy / (distance || 1)

                // Non-linear acceleration - faster as it gets closer to target
                const distanceFactor = Math.max(0.5, 1 - Math.min(distance, 400) / 400)

                // Damping factor to prevent overshooting for small targets
                // Reduce velocity more aggressively as bubbles get closer to small targets
                const isSmallTarget = targetPosition.width < 50 || targetPosition.height < 50
                const dampingFactor = isSmallTarget ? Math.max(0.85, 1 - Math.pow(1 - Math.min(distance, 200) / 200, 2)) : 1

                // Apply acceleration with some randomness for natural movement
                const acceleration = 0.8 * distanceFactor // Lower base acceleration for small targets
                const jitter = (Math.random() - 0.5) * 0.2 // Reduced jitter

                // Calculate new velocity with damping
                let newVelocityX = bubble.velocityX * dampingFactor + dirX * acceleration + jitter
                let newVelocityY = bubble.velocityY * dampingFactor + dirY * acceleration + jitter

                // Apply max speed - lower for small targets to prevent orbiting
                const maxSpeed = isSmallTarget
                    ? 4 + (1 - Math.min(distance, 300) / 300) * 8 // Lower max speed for small targets
                    : 8 + (1 - Math.min(distance, 300) / 300) * 15

                const currentSpeed = Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY)

                if (currentSpeed > maxSpeed) {
                    newVelocityX = (newVelocityX / currentSpeed) * maxSpeed
                    newVelocityY = (newVelocityY / currentSpeed) * maxSpeed
                }

                // For very close bubbles to small targets, apply additional damping to prevent orbiting
                if (isSmallTarget && distance < 50) {
                    const closeRangeDamping = 0.9
                    newVelocityX *= closeRangeDamping
                    newVelocityY *= closeRangeDamping
                }

                // Update position
                return {
                    ...bubble,
                    x: bubble.x + newVelocityX,
                    y: bubble.y + newVelocityY,
                    velocityX: newVelocityX,
                    velocityY: newVelocityY,
                }
            })
            .filter(bubble => bubble.opacity > 0 && bubble.size > 0)

        // Play sound if any bubbles were newly absorbed
        if (newlyAbsorbedCount > 0 && !isMobile) {
            playAbsorptionSound()
        }

        // Check if all bubbles have been absorbed and removed
        if (updatedBubbles.length === 0 && totalBubbles > 0) {
            // All bubbles have been absorbed and animation is complete
            if (onCompleteCallbackRef.current) {
                // Avoid multiple calls by checking time since last call
                const now = Date.now()
                if (now - lastBubbleAbsorbedRef.current > 300) {
                    lastBubbleAbsorbedRef.current = now
                    console.log('Animation complete - all bubbles absorbed')

                    // Execute callback and clean up
                    const callback = onCompleteCallbackRef.current
                    onCompleteCallbackRef.current = null // Clear the callback before execution

                    // Clean up animation state
                    activeAnimationRef.current = false

                    // Execute callback after cleanup
                    if (callback) callback()
                }
            }
        }

        setBubbles(updatedBubbles)

        if (activeAnimationRef.current) {
            animationFrameRef.current = requestAnimationFrame(animateBubbles)
        }
    }, [targetPosition, updateTargetPosition, playAbsorptionSound])

    // Start or stop animation based on bubbles
    useEffect(() => {
        // Start animation if there are bubbles and animation is active
        if (bubbles.length > 0 && !animationFrameRef.current && activeAnimationRef.current) {
            animationFrameRef.current = requestAnimationFrame(animateBubbles)
        }

        // Clean up animation frame on unmount
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
                animationFrameRef.current = null
            }
        }
    }, [bubbles.length, animateBubbles])

    const spawnBubbles = useCallback(
        (x?: number, y?: number, count = 10, spawnElementId?: string, onComplete?: () => void) => {
            if (!containerRef.current) return

            // Store the callback for later use
            if (onComplete) {
                onCompleteCallbackRef.current = onComplete
            }

            // Set animation as active
            activeAnimationRef.current = true

            const containerRect = containerRef.current.getBoundingClientRect()
            let spawnX: number
            let spawnY: number

            // If spawnElementId is provided, use its position
            if (spawnElementId) {
                const spawnElement = document.getElementById(spawnElementId)

                if (spawnElement) {
                    const spawnRect = spawnElement.getBoundingClientRect()
                    spawnX = spawnRect.left + spawnRect.width / 2 - containerRect.left
                    spawnY = spawnRect.top + spawnRect.height / 2 - containerRect.top
                } else {
                    // Fallback to provided coordinates or center
                    spawnX = x !== undefined ? x - containerRect.left : containerRect.width / 2
                    spawnY = y !== undefined ? y - containerRect.top : containerRect.height / 2
                }
            } else if (x !== undefined && y !== undefined) {
                // Use provided coordinates
                spawnX = x - containerRect.left
                spawnY = y - containerRect.top
            } else {
                // Default to center of container
                spawnX = containerRect.width / 2
                spawnY = containerRect.height / 2
            }

            const newBubbles: Bubble[] = []

            for (let i = 0; i < count; i++) {
                // Random initial position around the spawn point with wider spread
                const angle = Math.random() * Math.PI * 2
                const distance = Math.random() * 30 // Wider initial spread
                const bubbleX = spawnX + Math.cos(angle) * distance
                const bubbleY = spawnY + Math.sin(angle) * distance

                // Random initial velocity (slight upward bias) with higher initial speed
                const initialVelocityX = (Math.random() - 0.5) * 6 // Slightly lower initial velocity
                const initialVelocityY = (Math.random() - 0.7) * 6 // Bias upward with slightly lower velocity

                newBubbles.push({
                    id: bubbleIdRef.current++,
                    x: bubbleX,
                    y: bubbleY,
                    size: Math.random() * 10 + 15, // Larger, more visible bubbles
                    opacity: 1,
                    velocityX: initialVelocityX,
                    velocityY: initialVelocityY,
                    absorbed: false,
                })
            }

            setBubbles(prev => [...prev, ...newBubbles])

            // Make sure target position is updated
            updateTargetPosition()

            // Start animation if not already running
            if (!animationFrameRef.current && activeAnimationRef.current) {
                animationFrameRef.current = requestAnimationFrame(animateBubbles)
            }
        },
        [updateTargetPosition, animateBubbles]
    )

    const BubbleAnimationComponent = ({
        // bubbleCount = 10,
        className,
    }: Omit<BubbleAnimationProps, 'targetSelector'>) => {
        return (
            <div
                ref={containerRef}
                className={`fixed inset-0 pointer-events-none z-[200] ${className || ''}`}
                style={{ display: bubbles.length > 0 ? 'block' : 'none' }} // Hide when no bubbles
            >
                {bubbles.map(bubble => (
                    <div
                        key={bubble.id}
                        className="absolute rounded-full"
                        style={{
                            left: `${bubble.x}px`,
                            top: `${bubble.y}px`,
                            width: `${bubble.size}px`,
                            height: `${bubble.size}px`,
                            background: bubble.absorbed
                                ? 'radial-gradient(circle, rgba(255,24,80,0.8) 0%, rgba(255,24,80,0.8) 100%)'
                                : 'radial-gradient(circle, rgba(255,24,80,1) 0%, rgba(255,24,80,1) 100%)',
                            boxShadow: bubble.absorbed ? '0 0 8px 1px rgba(255,24,80,0.4)' : '0 0 10px 2px rgba(255,24,80,0.6)',
                            opacity: bubble.opacity,
                            transform: `translate(-50%, -50%) scale(${bubble.absorbed ? 0.8 : 1})`,
                            transition: bubble.absorbed ? 'opacity 0.2s ease-out, transform 0.2s ease-out' : 'none',
                        }}
                    />
                ))}
            </div>
        )
    }

    return { spawnBubbles, BubbleAnimationComponent, cleanupAnimation }
}
