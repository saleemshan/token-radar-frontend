import { useEffect } from 'react'

const usePreventZoomOnMobile = () => {
    useEffect(() => {
        // Function to dynamically set the viewport meta tag
        const disableZoom = () => {
            const isMobile = /android|iphone|ipad|ipod|windows phone|opera mini|iemobile/i.test(navigator.userAgent.toLowerCase())

            if (isMobile && typeof document !== 'undefined') {
                let viewportMeta: HTMLMetaElement | null = document.querySelector('meta[name="viewport"]')

                // Create a viewport meta tag if it doesn't exist
                if (!viewportMeta) {
                    viewportMeta = document.createElement('meta')
                    viewportMeta.name = 'viewport'
                    document.head.appendChild(viewportMeta)
                }

                // Disable zooming
                if (viewportMeta) {
                    viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
                }
            }
        }

        // Disable zoom on component mount
        disableZoom()

        // Optional: Cleanup function to reset viewport settings if needed
        // return () => {
        //   if (typeof document !== 'undefined') {
        //     const viewportMeta = document.querySelector('meta[name="viewport"]');
        //     if (viewportMeta) {
        //       viewportMeta.content = 'width=device-width, initial-scale=1'; // Reset to default
        //     }
        //   }
        // };
    }, []) // Empty dependency array to ensure this effect only runs on mount
}

export default usePreventZoomOnMobile
