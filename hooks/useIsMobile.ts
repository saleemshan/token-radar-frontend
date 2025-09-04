import { useState, useEffect } from 'react'

// Function to detect mobile devices based on user agent
const detectMobileUserAgent = (): boolean => {
    if (typeof navigator !== 'undefined') {
        const userAgent =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            navigator.userAgent || navigator.vendor || (window as any).opera
        return /android|iphone|ipad|ipod|windows phone|opera mini|iemobile/i.test(userAgent.toLowerCase())
    }
    return false
}

const useIsMobile = (breakpoint: number = 768) => {
    const [isMobile, setIsMobile] = useState<boolean>(true)

    useEffect(() => {
        const handleDetection = () => {
            const isUserAgentMobile = detectMobileUserAgent()
            const isWidthMobile = typeof window !== 'undefined' && window.innerWidth < breakpoint

            // Determine mobile status based on either user agent or window width
            setIsMobile(isUserAgentMobile || isWidthMobile)
        }

        // Initial detection
        handleDetection()

        // Add event listener for resizing the window
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleDetection)

            // Clean up event listener on component unmount
            return () => {
                window.removeEventListener('resize', handleDetection)
            }
        }
    }, [breakpoint])

    return isMobile
}

export default useIsMobile
