import { useCallback, useEffect, useMemo, useRef } from 'react'

export const detectiOS = (): boolean => {
    if (typeof navigator === 'undefined') {
        return false
    }

    const toMatch = [/iPhone/i, /iPad/i, /iPod/i]

    return toMatch.some(toMatchItem => {
        return RegExp(toMatchItem).exec(navigator.userAgent)
    })
}

export const detectAndroid = (): boolean => {
    if (typeof navigator === 'undefined') {
        return false
    }
    const toMatch = [/Android/i, /webOS/i, /BlackBerry/i, /Windows Phone/i]

    return toMatch.some(toMatchItem => {
        return RegExp(toMatchItem).exec(navigator.userAgent)
    })
}

export const detectMobile = (): boolean => {
    return detectiOS() || detectAndroid()
}

export const useHaptic = (): { triggerHaptic: (duration?: number) => void } => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const labelRef = useRef<HTMLLabelElement | null>(null)
    const isIOS = useMemo(() => detectiOS(), [])

    useEffect(() => {
        // Create and append input element
        const input = document.createElement('input')
        input.type = 'checkbox'
        input.id = 'haptic-switch'
        input.setAttribute('switch', '')
        input.style.display = 'none'
        document.body.appendChild(input)
        inputRef.current = input

        // Create and append label element
        const label = document.createElement('label')
        label.htmlFor = 'haptic-switch'
        label.style.display = 'none'
        document.body.appendChild(label)
        labelRef.current = label

        // Cleanup function
        return () => {
            if (input.parentNode === document.body) {
                document.body.removeChild(input)
            }
            if (label.parentNode === document.body) {
                document.body.removeChild(label)
            }
        }
    }, [])

    const triggerHaptic = useCallback(
        (duration = 20) => {
            // The iOS workaround does not support custom durations.
            if (isIOS) {
                labelRef.current?.click()
            } else {
                if (navigator?.vibrate) {
                    navigator.vibrate(duration)
                } else {
                    // Fallback for non-iOS devices that don't support the Vibration API
                    labelRef.current?.click()
                }
            }
        },
        [isIOS]
    )

    return { triggerHaptic }
}

export default useHaptic
