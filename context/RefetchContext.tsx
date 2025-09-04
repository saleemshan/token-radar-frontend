// context/RefetchContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type RefetchContextType = {
    refetchSignal: number
}

const RefetchContext = createContext<RefetchContextType | undefined>(undefined)

export const RefetchProvider = ({ children }: { children: ReactNode }) => {
    const [refetchSignal, setRefetchSignal] = useState(0)
    const [lastActivity, setLastActivity] = useState(Date.now())
    const WAIT_TIME = 10 * 60 * 1000
    useEffect(() => {
        const updateActivity = () => setLastActivity(Date.now())

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('Refetch | document visible')

                const now = Date.now()
                if (now - lastActivity > WAIT_TIME) {
                    setRefetchSignal(prev => prev + 1)
                }
                setLastActivity(now)
            }
        }

        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']
        events.forEach(event => document.addEventListener(event, updateActivity))
        document.addEventListener('visibilitychange', handleVisibilityChange)

        const interval = setInterval(() => {
            const now = Date.now()
            if (now - lastActivity > WAIT_TIME && document.visibilityState === 'visible') {
                setRefetchSignal(prev => prev + 1)
                setLastActivity(now)
            }
        }, 5000)

        return () => {
            events.forEach(event => document.removeEventListener(event, updateActivity))
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            clearInterval(interval)
        }
    }, [lastActivity, WAIT_TIME])

    return <RefetchContext.Provider value={{ refetchSignal }}>{children}</RefetchContext.Provider>
}

export const useRefetchSignal = () => {
    const context = useContext(RefetchContext)
    if (!context) throw new Error('useRefetchSignal must be used within RefetchProvider')
    return context.refetchSignal
}
