'use client'
import React, { useEffect, useState } from 'react'

interface DecimalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
    className?: string
    max?: number
    maxDecimals?: number
    allowNegative?: boolean
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search' | undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any // For any additional props
}

const DecimalInput: React.FC<DecimalInputProps> = ({
    value = '',
    onChange,
    className,
    max,
    maxDecimals,
    allowNegative = false,
    inputMode = 'text',
    ...props
}) => {
    const [inputValue, setInputValue] = useState<string>(value)

    // Handle input change and allow only decimal values
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = e.target.value
        const isBackspace = e.nativeEvent instanceof InputEvent && e.nativeEvent.inputType === 'deleteContentBackward'

        // If it's a backspace event and the current value is "0", allow clearing
        if (isBackspace && inputValue === '0') {
            newValue = ''
        }

        // Create regex pattern based on whether negative numbers are allowed
        const regexPattern = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/

        // Allow empty value, single dot, or valid decimal
        if (newValue === '' || newValue === '-' || regexPattern.test(newValue)) {
            // Remove leading zeros unless it's just "0" or "-0"
            if (newValue !== '0' && newValue !== '-0') {
                newValue = newValue.replace(/^(-)?0+(?!\.|$)/, '$1')
            }

            // Limit decimal places if maxDecimals is set
            if (maxDecimals !== undefined && newValue.includes('.')) {
                const parts = newValue.split('.')
                if (maxDecimals === 0) {
                    // If maxDecimals is 0, remove the decimal point and everything after it
                    newValue = parts[0]
                } else if (parts[1] && parts[1].length > maxDecimals) {
                    newValue = `${parts[0]}.${parts[1].substring(0, maxDecimals)}`
                }
            }

            // Check max constraint only if newValue is a complete number and not empty
            if (max !== undefined && newValue !== '' && !newValue.endsWith('.') && parseFloat(newValue) > max) {
                newValue = max.toString()
            }

            setInputValue(newValue)
            if (onChange) {
                // Create a synthetic event with the new value
                const syntheticEvent = {
                    ...e,
                    target: {
                        ...e.target,
                        value: newValue,
                    },
                }
                onChange(syntheticEvent)
            }
        }
    }

    useEffect(() => {
        let newValue = value

        // Create regex pattern based on whether negative numbers are allowed
        const regexPattern = allowNegative ? /^-?\d*\.?\d*$/ : /^\d*\.?\d*$/

        // Allow empty value, single dot, or valid decimal
        if (newValue === '' || newValue === '-' || regexPattern.test(newValue)) {
            // Remove leading zeros unless it's just "0" or "-0"
            if (newValue !== '0' && newValue !== '-0') {
                newValue = newValue.replace(/^(-)?0+(?!\.|$)/, '$1')
            }

            // Limit decimal places if maxDecimals is set
            if (maxDecimals !== undefined && newValue.includes('.')) {
                const parts = newValue.split('.')
                if (maxDecimals === 0) {
                    // If maxDecimals is 0, remove the decimal point and everything after it
                    newValue = parts[0]
                } else if (parts[1] && parts[1].length > maxDecimals) {
                    newValue = `${parts[0]}.${parts[1].substring(0, maxDecimals)}`
                }
            }

            setInputValue(newValue)
        }
    }, [value, maxDecimals, allowNegative])

    return <input type="text" value={inputValue} onChange={handleChange} className={className} inputMode={inputMode} {...props} />
}

export default DecimalInput
