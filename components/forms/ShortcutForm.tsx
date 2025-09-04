import { useKeyboardShortcutContext } from '@/context/KeyboardShortcutContext'
import { ShortcutAction } from '@/context/KeyboardShortcutContext'
import { useState } from 'react'
import { defaultShortcuts } from '@/context/KeyboardShortcutContext'
import { toast } from 'react-toastify'
import Button from '../ui/Button'
import { FaArrowDown, FaArrowLeft, FaArrowRight, FaArrowUp } from 'react-icons/fa6'
import useHaptic from '@/hooks/useHaptic'

const actions: ShortcutAction[] = ['longBig', 'longSmall', 'shortBig', 'shortSmall']

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ShortcutForm({ handleToggleModal }: { handleToggleModal: () => void }) {
    const { shortcuts, resetShortcuts, setShortcutsBulk } = useKeyboardShortcutContext()
    const { triggerHaptic } = useHaptic()

    const [editing, setEditing] = useState<ShortcutAction | null>(null)
    const [tempShortcuts, setTempShortcuts] = useState({ ...shortcuts })
    // const [error, setError] = useState<string | null>(null)
    const [comboPreview, setComboPreview] = useState<Record<ShortcutAction, string>>({
        longBig: '',
        longSmall: '',
        shortBig: '',
        shortSmall: '',
    })

    const handleKeyCapture = (e: React.KeyboardEvent<HTMLInputElement>, action: ShortcutAction) => {
        e.preventDefault()
        const combo: string[] = []

        if (e.ctrlKey) combo.push('ctrl')
        if (e.metaKey) combo.push('meta')
        if (e.shiftKey) combo.push('shift')
        if (e.altKey) combo.push('alt')

        const key = e.key.toLowerCase()
        if (!['control', 'shift', 'alt', 'meta'].includes(key)) combo.push(key)

        const newCombo = combo.join('+')

        // Show real-time
        setComboPreview(prev => ({ ...prev, [action]: newCombo }))

        if (combo.length < 2) return

        const isUsed = Object.entries(tempShortcuts).some(([a, c]) => a !== action && c === newCombo)

        if (isUsed) {
            toast.error(`Shortcut "${newCombo}" is already in use.`)
            // setError(`Shortcut "${newCombo}" is already in use.`)
        } else {
            // setError(null)
            setTempShortcuts(prev => ({ ...prev, [action]: newCombo }))
            setEditing(null)
            setComboPreview(prev => ({ ...prev, [action]: '' }))
        }
    }

    const handleSave = () => {
        triggerHaptic(50)
        const combos = Object.values(tempShortcuts)
        const uniqueCombos = new Set(combos)

        if (uniqueCombos.size !== combos.length) {
            toast.error('Some shortcuts are duplicated.')
            return
        }

        setShortcutsBulk(tempShortcuts)
        // setError(null)
        toast.success('Shortcuts successfully updated.')
        // handleToggleModal()
    }

    const handleReset = () => {
        resetShortcuts()
        setTempShortcuts({ ...defaultShortcuts }) // defaultShortcuts must be imported
        // setError(null)
    }

    const handleGetLabel = (action: ShortcutAction) => {
        switch (action) {
            case 'longBig':
                return 'Long Big'
            case 'longSmall':
                return 'Long Small'
            case 'shortBig':
                return 'Short Big'
            case 'shortSmall':
                return 'Short Small'
                break
            default:
                return ''
                break
        }
    }

    return (
        <div className="flex flex-col w-full gap-3 flex-1">
            <div className="flex flex-col flex-1 gap-2">
                <div className="mb-2 font-semibold">News Trading Shortcuts</div>
                <div className="flex flex-col gap-2 mb-2">
                    <div className="flex items-center gap-2 up">
                        <label className="w-32 capitalize">Change News</label>
                        <div className="w-32 min-w-32 uppercase bg-neutral-900 rounded-lg px-2 py-1 flex items-center justify-center gap-1 cursor-not-allowed">
                            <FaArrowUp />
                            /
                            <FaArrowDown />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 up">
                        <label className="w-32 capitalize">Change Tickers</label>
                        <div className="w-32 min-w-32 uppercase bg-neutral-900 rounded-lg px-2 py-1 flex items-center justify-center gap-1 cursor-not-allowed">
                            <FaArrowLeft />
                            /
                            <FaArrowRight />
                        </div>
                    </div>
                </div>
                {actions.map(action => (
                    <div key={action} className="flex items-center gap-2 up">
                        <label className="w-32 capitalize">{handleGetLabel(action)}</label>
                        {editing === action ? (
                            <input
                                autoFocus
                                value={comboPreview[action] || ''}
                                onKeyDown={e => handleKeyCapture(e, action)}
                                onBlur={() => {
                                    setEditing(null)
                                    setComboPreview(prev => ({ ...prev, [action]: '' }))
                                }}
                                placeholder="Press combo"
                                className="w-32 min-w-32 bg-neutral-800 rounded-lg px-2 py-1 uppercase"
                            />
                        ) : (
                            <button onClick={() => setEditing(action)} className="w-32 min-w-32 uppercase bg-neutral-900 rounded-lg px-2 py-1">
                                {tempShortcuts[action] || 'Not set'}
                            </button>
                        )}
                    </div>
                ))}

                <div>
                    <button type="button" className="text-2xs hover:underline text-neutral-text-dark" onClick={handleReset}>
                        Reset to Default
                    </button>
                </div>

                {/* {error && <div className="text-negative text-xs">{error}</div>} */}
            </div>

            <div className="flex flex-col w-full gap-3">
                <div className="flex items-center justify-end gap-3 text-xs">
                    <Button onClick={handleToggleModal} variant="ghost">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} variant="primary">
                        <span>Save</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
