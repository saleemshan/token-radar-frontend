import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import Modal, { ModalMethods } from './Modal'

import NotificationPreferencesForm from '../forms/NotificationPreferencesForm'
import { FaBell, FaClock, FaDisplay, FaKeyboard } from 'react-icons/fa6'
import TimezoneForm from '../forms/TimezoneForm'
import DisplayForm from '../forms/DisplayForm'
import SocialForm from '../forms/SocialForm'
import { MdAlternateEmail } from 'react-icons/md'
import ShortcutForm from '../forms/ShortcutForm'
import XButton from '../ui/XButton'

export type SettingsTab = 'Notifications' | 'Timezone' | 'Display' | 'Social' | 'Shortcuts'

const SettingsModal = forwardRef((_, ref) => {
    const tabs = useMemo(() => {
        const tabs = [
            {
                label: 'Notifications',
                icon: <FaBell className="size-4" />,
            },
            {
                label: 'Shortcuts',
                icon: <FaKeyboard className="size-4" />,
            },
            {
                label: 'Display',
                icon: <FaDisplay className="size-4" />,
            },

            {
                label: 'Timezone',
                icon: <FaClock className="size-4" />,
            },
        ]

        if (process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LINK === 'true') {
            tabs.push({
                label: 'Social',
                icon: <MdAlternateEmail className="size-4" />,
            })
        }

        return tabs
    }, [])

    const [activeTab, setActiveTab] = useState(tabs[0])

    const modalRef = React.createRef<ModalMethods>()

    const handleToggleModal = useCallback(
        (activeTab?: SettingsTab) => {
            if (activeTab) {
                const targetTab = tabs.find(tab => tab.label === activeTab)
                if (targetTab) setActiveTab(targetTab)
            }

            modalRef.current?.toggleModal()
        },
        [modalRef, tabs]
    )

    const handleCloseModal = useCallback(() => {
        modalRef.current?.closeModal()
    }, [modalRef])
    const handleOpenModal = useCallback(() => {
        modalRef.current?.openModal()
    }, [modalRef])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
        openModal: handleOpenModal,
        closeModal: handleCloseModal,
    }))

    return (
        <Modal id="settings-modal" ref={modalRef} padding=" p-0 md:p-3">
            <div className="md:max-w-xl bg-black md:border border-border md:rounded-lg overflow-hidden flex flex-col w-full h-full md:max-h-[80vh] md:h-fit">
                <div className="p-3 flex items-center justify-between border-b border-border  bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Settings</div>
                    <div>
                        <XButton
                            onClick={() => {
                                modalRef.current?.closeModal()
                            }}
                        />
                    </div>
                </div>

                <div className="min-h-[40vh]  lg:max-h-[40vh] overflow-y-auto flex flex-col md:flex-row w-full divide-y md:divide-y-0 md:divide-x divide-border relative">
                    <div className="flex md:flex-col gap-2 p-2 md:max-w-[3.1rem] overflow-hidden md:hover:max-w-[12rem] overflow-x-auto no-scrollbar group md:absolute inset-y-0 left-0 transition-all justify-start duration-300 md:border-r border-border bg-black z-10">
                        {tabs.map((tab, index) => (
                            <button
                                title={tab.label}
                                aria-label={tab.label}
                                id={`settings-${tab.label.toLowerCase()}-highlight`}
                                key={index}
                                onClick={() => setActiveTab(tab)}
                                className={`${
                                    activeTab.label === tab.label ? 'bg-neutral-900 text-neutral-text' : ' text-neutral-text-dark/70'
                                } flex items-center justify-start gap-2 md:w-full text-xs uppercase  hover:bg-neutral-900 apply-transition font-semibold  rounded-lg p-2  tracking-wide overflow-hidden`}
                            >
                                <span className="min-w-fit"> {tab.icon}</span>
                                <span className="hidden md:block text-2xs">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-col flex-1 w-full p-3 md:pl-[3.8rem]  ">
                        {activeTab.label === 'Timezone' && <TimezoneForm handleToggleModal={handleToggleModal} />}
                        {activeTab.label === 'Notifications' && <NotificationPreferencesForm handleToggleModal={handleToggleModal} />}
                        {activeTab.label === 'Display' && <DisplayForm handleToggleModal={handleToggleModal} />}
                        {activeTab.label === 'Social' && <SocialForm handleToggleModal={handleToggleModal} />}
                        {activeTab.label === 'Shortcuts' && <ShortcutForm handleToggleModal={handleToggleModal} />}
                    </div>
                </div>
            </div>
        </Modal>
    )
})

SettingsModal.displayName = 'SettingsModal'

export default SettingsModal
