import { useEffect, useState } from 'react'

export function useContainerWidth(ref: React.RefObject<HTMLElement>) {
    const [width, setWidth] = useState(0)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const updateWidth = () => setWidth(element.offsetWidth)

        updateWidth()

        const resizeObserver = new ResizeObserver(() => updateWidth())
        resizeObserver.observe(element)

        return () => resizeObserver.disconnect()
    }, [ref])

    return width
}
