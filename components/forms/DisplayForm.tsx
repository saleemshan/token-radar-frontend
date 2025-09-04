import React, { useState } from 'react'

import Button from '../ui/Button'
import { useSettingsContext } from '@/context/SettingsContext'
import { toast } from 'react-toastify'
import ToggleButton from '../ToggleButton'
import useHaptic from '@/hooks/useHaptic'

interface DisplayFormProps {
    handleToggleModal: () => void
}

const DisplayForm = ({ handleToggleModal }: DisplayFormProps) => {
    const { enableBubbleAnimation, setEnableBubbleAnimation } = useSettingsContext()
    const { triggerHaptic } = useHaptic()

    const [isOn, setIsOn] = useState(enableBubbleAnimation)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        triggerHaptic(50)
        setEnableBubbleAnimation(isOn)
        localStorage.setItem('settingsEnableBubbleAnimation', JSON.stringify(isOn))
        toast.success('Bubble animation effect successfully updated.')
    }

    return (
        <div className="flex flex-col w-full gap-3 flex-1">
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center justify-between gap-1">
                    <label htmlFor="timezone" className="text-sm text-neutral-text">
                        Enable Exp Bubble Animation
                    </label>
                    <ToggleButton isOn={isOn} onToggle={setIsOn} />
                </div>
            </div>
            <div className="flex flex-col w-full gap-3">
                <div className="flex items-center justify-end gap-3 text-xs">
                    <Button onClick={handleToggleModal} variant="ghost">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="primary">
                        <span>Save</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DisplayForm
