'use client'
import { useSettingsContext } from '@/context/SettingsContext'
import React, { useState } from 'react'
import { FaCog } from 'react-icons/fa'

const HideSmallAssetsButton = ({ className }: { className?: string }) => {
    const [showSettingMenu, setShowSettingMenu] = useState(false)
    const { setHideSmallAssets, hideSmallAssets } = useSettingsContext()
    const handleHideSmallAssetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setHideSmallAssets(e.target.checked)
        localStorage.setItem('settingsHideSmallAssets', JSON.stringify(e.target.checked))
        setShowSettingMenu(false)
        //update to local storage
    }
    return (
        <div className={`${className} relative `}>
            <button
                type="button"
                onClick={() => {
                    setShowSettingMenu(!showSettingMenu)
                }}
                className={` flex hover:bg-neutral-900 border-border border bg-table-odd rounded-lg w-7 h-7 items-center justify-center text-neutral-text apply-transition`}
            >
                <FaCog className={`text-xs `} />
            </button>

            {showSettingMenu && (
                <div className="absolute z-50 right-0 top-8 min-w-fit border border-border p-2 bg-black rounded-lg">
                    <div className="flex items-start gap-2 min-w-fit w-32">
                        <input type="checkbox" checked={hideSmallAssets} onChange={handleHideSmallAssetsChange} className="mt-1" />
                        <label htmlFor="Checkbox" className="text-2xs min-w-fit">{`Hide small assets on balances`}</label>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HideSmallAssetsButton
