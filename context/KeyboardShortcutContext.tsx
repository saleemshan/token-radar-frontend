import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import hotkeys from 'hotkeys-js'

export type ShortcutAction = 'longBig' | 'longSmall' | 'shortBig' | 'shortSmall'

type RefsMap = {
    longBig?: React.RefObject<HTMLButtonElement>
    longSmall?: React.RefObject<HTMLButtonElement>
    shortBig?: React.RefObject<HTMLButtonElement>
    shortSmall?: React.RefObject<HTMLButtonElement>
}

type ShortcutConfig = {
    [K in ShortcutAction]?: string // e.g., "ctrl+1"
}

type KeyboardShortcutContextType = {
    refs: RefsMap
    setOnArrowRight: (fn: () => void) => void
    setOnArrowLeft: (fn: () => void) => void
    setOnArrowUp: (fn: () => void) => void
    setOnArrowDown: (fn: () => void) => void
    shortcuts: ShortcutConfig
    updateShortcut: (action: ShortcutAction, keys: string) => boolean
    resetShortcuts: () => void
    setShortcutsBulk: (newShortcuts: ShortcutConfig) => void
}

export const defaultShortcuts: ShortcutConfig = {
    longBig: 'ctrl+1',
    longSmall: 'ctrl+2',
    shortBig: 'ctrl+3',
    shortSmall: 'ctrl+4',
}

const STORAGE_KEY = 'keyboard-shortcuts'

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType>({
    refs: {
        longBig: { current: null },
        longSmall: { current: null },
        shortBig: { current: null },
        shortSmall: { current: null },
    },
    setOnArrowRight: () => {},
    setOnArrowLeft: () => {},
    setOnArrowUp: () => {},
    setOnArrowDown: () => {},
    shortcuts: { ...defaultShortcuts },
    updateShortcut: () => false,
    resetShortcuts: () => {},
    setShortcutsBulk: () => {},
})

export const KeyboardShortcutProvider = ({ children }: { children: React.ReactNode }) => {
    const refs: RefsMap = {
        longBig: useRef(null),
        longSmall: useRef(null),
        shortBig: useRef(null),
        shortSmall: useRef(null),
    }

    const [shortcuts, setShortcuts] = useState<ShortcutConfig>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            return stored ? JSON.parse(stored) : defaultShortcuts
        } catch {
            return defaultShortcuts
        }
    })

    const onArrowRight = useRef<() => void>()
    const onArrowLeft = useRef<() => void>()
    const onArrowUp = useRef<() => void>()
    const onArrowDown = useRef<() => void>()

    const setOnArrowRight = useCallback((fn: () => void) => {
        onArrowRight.current = fn
    }, [])

    const setOnArrowLeft = useCallback((fn: () => void) => {
        onArrowLeft.current = fn
    }, [])

    const setOnArrowUp = useCallback((fn: () => void) => {
        onArrowUp.current = fn
    }, [])

    const setOnArrowDown = useCallback((fn: () => void) => {
        onArrowDown.current = fn
    }, [])

    const bindShortcuts = useCallback((config: ShortcutConfig) => {
        hotkeys.unbind()

        Object.entries(config).forEach(([action, combo]) => {
            if (!combo || combo.split('+').length < 2) return
            hotkeys(combo, e => {
                e.preventDefault()
                refs[action as ShortcutAction]?.current?.click()
            })
        })

        hotkeys('right', () => onArrowRight.current?.())
        hotkeys('left', () => onArrowLeft.current?.())
        hotkeys('up', () => onArrowUp.current?.())
        hotkeys('down', () => onArrowDown.current?.())
    }, [])

    useEffect(() => {
        bindShortcuts(shortcuts)
    }, [shortcuts, bindShortcuts])

    const updateShortcut = (action: ShortcutAction, keys: string): boolean => {
        if (keys.split('+').length < 2) return false

        const isConflict = Object.entries(shortcuts).some(([a, combo]) => a !== action && combo === keys)

        if (isConflict) return false

        const updated = { ...shortcuts, [action]: keys }
        setShortcuts(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return true
    }

    const resetShortcuts = () => {
        setShortcuts(defaultShortcuts)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultShortcuts))
    }

    const setShortcutsBulk = (newShortcuts: ShortcutConfig) => {
        console.log('aw')

        setShortcuts(newShortcuts)
        console.log({ newShortcuts })

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts))
    }

    return (
        <KeyboardShortcutContext.Provider
            value={{
                refs,
                setOnArrowRight,
                setOnArrowLeft,
                setOnArrowUp,
                setOnArrowDown,
                shortcuts,
                updateShortcut,
                resetShortcuts,
                setShortcutsBulk,
            }}
        >
            {children}
        </KeyboardShortcutContext.Provider>
    )
}

export const useKeyboardShortcutContext = () => useContext(KeyboardShortcutContext)
