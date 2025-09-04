'use client'

import React, { useEffect, useRef, useState } from 'react'
import EmptyData from './global/EmptyData'
import { FaMinus, FaPlus } from 'react-icons/fa6'
import Tag from './Tag'
import { toast } from 'react-toastify'

const SubscriptionsSelector = ({
    initialSelectedAccounts,
    accountList,
    defaultList,
    onSelectedAccountsChange,
    customInput = false,
}: {
    initialSelectedAccounts: string[]
    accountList: string[]
    defaultList: string[]
    onSelectedAccountsChange: (selectedAccounts: string[]) => void
    customInput?: boolean
}) => {
    const selectedListContainerRef = useRef<HTMLDivElement>(null)

    const [accountOptions, setAccountOptions] = useState<string[]>([])
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
    const [unselectedAccounts, setUnselectedAccounts] = useState<string[]>([])
    const [customInputValue, setCustomInputValue] = useState<string>('')

    const handleAddSelectedAccount = (account: string) => {
        if (selectedAccounts.includes(`${account}`)) {
            toast.error('Account already exists in the social list')
            return
        }

        const customAccounts = selectedAccounts.filter(account => !accountList.includes(account))

        if (customAccounts.length >= 5) {
            toast.error('You can only add up to 5 custom accounts.')
            return
        }

        const newSelectedAccounts = [...selectedAccounts, account]
        setSelectedAccounts(newSelectedAccounts)
        onSelectedAccountsChange(newSelectedAccounts)

        setTimeout(() => {
            selectedListContainerRef.current?.scrollTo({
                top: selectedListContainerRef.current.scrollHeight,
                behavior: 'smooth',
            })
        }, 100)
    }

    const handleRemoveSelectedAccount = (account: string) => {
        const newSelectedAccounts = selectedAccounts.filter(selectedAccount => selectedAccount !== account)
        setSelectedAccounts(newSelectedAccounts)
        onSelectedAccountsChange(newSelectedAccounts)
    }

    useEffect(() => {
        if (accountOptions && selectedAccounts) {
            const unselectedAccounts = accountOptions.filter(account => !selectedAccounts.includes(account))
            setUnselectedAccounts(unselectedAccounts)
        }
    }, [accountOptions, selectedAccounts])

    useEffect(() => {
        if (initialSelectedAccounts && initialSelectedAccounts.length > 0) {
            setSelectedAccounts(initialSelectedAccounts)
            onSelectedAccountsChange(initialSelectedAccounts)
        }
    }, [initialSelectedAccounts, onSelectedAccountsChange])

    useEffect(() => {
        setAccountOptions(accountList)
    }, [accountList])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col border border-border rounded-lg min-h-[20vh] max-h-[20vh]  md:min-h-[26vh] md:max-h-[26vh] overflow-hidden">
                <div className="border-b border-border p-2 text-xs font-semibold">My List</div>
                <div className="flex flex-col max-h-full flex-1 overflow-y-auto" ref={selectedListContainerRef}>
                    {defaultList &&
                        defaultList.length > 0 &&
                        defaultList.map(account => {
                            return (
                                <div
                                    key={account}
                                    className="group px-2 min-h-9 max-h-9 text-xs flex items-center justify-between bg-table-odd even:bg-table-even "
                                >
                                    <div className="flex items-center gap-1">
                                        <span>{account}</span>
                                        <Tag>Default</Tag>
                                    </div>
                                </div>
                            )
                        })}
                    {selectedAccounts.length > 0 &&
                        selectedAccounts.map(account => {
                            return (
                                <div
                                    key={account}
                                    className="group px-2 min-h-9 max-h-9 text-xs flex items-center justify-between bg-table-odd even:bg-table-even "
                                >
                                    <div className="flex items-center gap-1">
                                        <span>{account}</span>
                                        {!accountList.includes(account) && <Tag>Custom</Tag>}
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleRemoveSelectedAccount(account)
                                        }}
                                        type="button"
                                        className=" flex md:group-hover:flex md:hidden bg-table-odd border border-border rounded-md items-center justify-center hover:bg-neutral-900 px-1 apply-transition text-neutral-text w-5 min-w-5 h-5 min-h-5"
                                    >
                                        <FaMinus className="text-2xs" />
                                    </button>
                                </div>
                            )
                        })}

                    {selectedAccounts.length <= 0 && defaultList.length <= 0 && <EmptyData text="My list is empty." />}
                </div>
                {customInput && (
                    <form
                        onSubmit={e => {
                            e.preventDefault()
                            handleAddSelectedAccount(`@${customInputValue}`)
                            setCustomInputValue('')
                        }}
                        className="flex relative overflow-hidden h-fit border-t border-border rounded-b-xl"
                    >
                        <span className="flex bg-black items-center justify-center left-2 px-2 border-r border-border h-full">@</span>

                        <input
                            onChange={e => {
                                const newValue = e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                                setCustomInputValue(newValue)
                            }}
                            value={customInputValue}
                            type="text"
                            placeholder="Custom Twitter Tag"
                            className=" bg-black pl-2 w-full h-8"
                        />
                    </form>
                )}
            </div>
            <div className="flex flex-col border border-border rounded-lg min-h-[20vh] max-h-[20vh]  md:min-h-[26vh] md:max-h-[26vh] overflow-hidden">
                <div className="border-b border-border p-2 text-xs font-semibold">Top Subscriptions List</div>
                <div className="flex flex-col  overflow-y-auto flex-1 max-h-full ">
                    {unselectedAccounts.length > 0 ? (
                        unselectedAccounts.map(account => {
                            return (
                                <div
                                    key={account}
                                    className="group px-2 min-h-9 max-h-9 text-xs flex items-center justify-between bg-table-odd even:bg-table-even "
                                >
                                    <div> {account}</div>
                                    <button
                                        onClick={() => {
                                            handleAddSelectedAccount(account)
                                        }}
                                        type="button"
                                        className=" flex md:group-hover:flex md:hidden bg-table-odd border border-border rounded-md items-center justify-center hover:bg-neutral-900 px-1 apply-transition text-neutral-text w-5 min-w-5 h-5 min-h-5"
                                    >
                                        <FaPlus className="text-2xs" />
                                    </button>
                                </div>
                            )
                        })
                    ) : (
                        <EmptyData padding="py-4" text="Subscriptions list is empty. You have selected all available accounts." />
                    )}
                </div>
            </div>
        </div>
    )
}

export default SubscriptionsSelector
