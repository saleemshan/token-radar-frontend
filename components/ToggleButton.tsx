'use client'
import clsx from 'clsx'
import React from 'react'

interface ToggleButtonProps {
    isOn: boolean
    onToggle?: (state: boolean) => void
    disabled?: boolean
    isLoading?: boolean
    mainContainerClassName?: string
    toggleSwitchClassName?: string
    size?: 'small' | 'medium' | 'large'
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isOn, onToggle, disabled, mainContainerClassName, toggleSwitchClassName, size = 'medium' }) => {
    const toggleSwitch = () => {
        if (disabled) {
            return
        }
        if (onToggle) {
            onToggle(!isOn)
        }
    }

    let containerSize: string
    let buttonSize: string
    let onTranslateX: string

    switch (size) {
        case 'small':
            containerSize = 'w-10 min-w-10 h-6'
            buttonSize = 'w-4 h-4'
            onTranslateX = 'translate-x-4'
            break
        case 'large':
            containerSize = 'w-14 min-w-14 h-9'
            buttonSize = 'w-6 h-6'
            onTranslateX = 'translate-x-6'
            break
        case 'medium':
        default:
            containerSize = 'w-12 min-w-12 h-8'
            buttonSize = 'w-5 h-5 '
            onTranslateX = 'translate-x-5'
            break
    }

    return (
        <div
            className={clsx(
                'relative  rounded-lg cursor-pointer bg-neutral-800 border border-border focus:ring-2 ring-primary-orange/50 focus:outline-none',
                isOn ? 'bg-positive/30' : 'bg-table-odd',
                disabled ? 'cursor-not-allowed' : '',
                mainContainerClassName,
                containerSize
            )}
            onClick={toggleSwitch}
        >
            <div
                className={clsx(
                    'absolute top-1/2 -translate-y-1/2 left-[.2rem]  rounded-md shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center',
                    isOn ? `${onTranslateX} bg-positive` : 'translate-x-0 bg-neutral-700 ',
                    toggleSwitchClassName,
                    buttonSize
                )}
            ></div>
        </div>
    )
}

export default ToggleButton
