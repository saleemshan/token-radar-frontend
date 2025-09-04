import React, { useState } from 'react'

import Button from '../ui/Button'
import { useSettingsContext } from '@/context/SettingsContext'
import { timezones } from '@/data/default/timezone'
import { toast } from 'react-toastify'
import useHaptic from '@/hooks/useHaptic'

interface TimezoneFormProps {
    handleToggleModal: () => void
}

const TimezoneForm = ({ handleToggleModal }: TimezoneFormProps) => {
    const { selectedTimezoneOption, setTimezoneOption } = useSettingsContext()
    const { triggerHaptic } = useHaptic()

    const [value, setValue] = useState(selectedTimezoneOption)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        triggerHaptic(50)
        setTimezoneOption(value)
        toast.success('Time zone successfully updated.')
    }

    return (
        <div className="flex flex-col w-full gap-3 flex-1">
            <div className="flex flex-col gap-2 flex-1">
                <div className="flex flex-col gap-1">
                    <label htmlFor="timezone" className="text-sm text-neutral-text">
                        Timezone
                    </label>
                    <select
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="w-full h-9 rounded-lg px-2 focus:outline-none text-neutral-text bg-table-odd border focus:border-border border-border text-sm focus:bg-neutral-900 cursor-pointer"
                    >
                        <option value="auto">Auto</option>
                        {timezones.map(tz => (
                            <option key={tz.value} value={tz.value}>
                                {tz.label}
                            </option>
                        ))}
                    </select>
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

export default TimezoneForm
