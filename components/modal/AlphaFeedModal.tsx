import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import Modal, { ModalMethods } from './Modal'
import Tooltip from '../Tooltip'
import { FaCircleInfo, FaXmark } from 'react-icons/fa6'
import { validateTwitterListId, validateTwitterUsernames } from '@/utils/string'
import { AlphaFeedPreferencesError, useMutateAlphaFeedPreferencesData, useAlphaFeedPreferencesData } from '@/hooks/data/useAlphaFeedPreferencesData'
import Spinner from '../Spinner'
import { useQueryClient } from '@tanstack/react-query'
import Input from '../Input'
import Button from '../ui/Button'
import { toast } from 'react-toastify'
import XButton from '../ui/XButton'

const AlphaFeedModal = forwardRef((_, ref) => {
    const modalRef = React.createRef<ModalMethods>()
    const queryClient = useQueryClient()
    const [accountsError, setAccountsError] = useState<undefined | string>(undefined)
    const [listsError, setListsError] = useState<undefined | string>(undefined)
    // const [error, setError] = useState<string | undefined>(undefined);

    const { data } = useAlphaFeedPreferencesData()

    const [newAccount, setNewAccount] = useState('')
    const [newList, setNewList] = useState('')

    const { mutate, isPending, isSuccess, isError, error: updateAlphaFeedError } = useMutateAlphaFeedPreferencesData()

    // useEffect(() => {
    //   console.log({ data });
    // }, [data]);

    useEffect(() => {
        if (data) {
            setPreferences({
                showDefaultDataSources: data.showDefaultDataSources,
                twitterAccounts: data.twitterAccounts && data.twitterAccounts.length > 0 ? data.twitterAccounts : [],
                twitterLists: data.twitterLists && data.twitterLists.length > 0 ? data.twitterLists : [],
            })
        }
    }, [data])

    const [preferences, setPreferences] = useState<AlphaFeedPreferences>({
        showDefaultDataSources: false,
        twitterAccounts: [],
        twitterLists: [],
    })

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isCustomError = (error: any): error is AlphaFeedPreferencesError => {
        return error instanceof AlphaFeedPreferencesError
    }

    const handleSubmitForm = async () => {
        setAccountsError(undefined)
        setListsError(undefined)
        // setError(undefined);
        let validInput = true

        if (preferences.twitterAccounts.length > 0 && !preferences.twitterAccounts.every(account => validateTwitterUsernames(account))) {
            setAccountsError(`Twitter accounts need to be valid usernames.`)
            validInput = false
        }
        if (preferences.twitterLists.length > 0 && !preferences.twitterLists.every(list => validateTwitterListId(list))) {
            setListsError('Twitter lists need to be valid X list IDs.')
            validInput = false
        }

        if (!validInput) return

        mutate(preferences)
    }

    const addAccount = () => {
        setAccountsError(undefined)
        setListsError(undefined)

        const newAccountWithSymbol = `@${newAccount}`

        if (newAccountWithSymbol && validateTwitterUsernames(newAccountWithSymbol)) {
            setPreferences(prev => ({
                ...prev,
                twitterAccounts: [...prev.twitterAccounts, newAccountWithSymbol],
            }))
            setNewAccount('')
        } else {
            setAccountsError('Invalid Twitter username, valid example: binance.')
        }
    }

    const addList = () => {
        setAccountsError(undefined)
        setListsError(undefined)

        if (newList && validateTwitterListId(newList)) {
            setPreferences(prev => ({
                ...prev,
                twitterLists: [...prev.twitterLists, newList],
            }))
            setNewList('')
        } else {
            setListsError('Invalid List ID, valid example: 1820445201963635053.')
        }
    }

    const removeAccount = (account: string) => {
        setPreferences(prev => ({
            ...prev,
            twitterAccounts: prev.twitterAccounts.filter(a => a !== account),
        }))
    }

    const removeList = (list: string) => {
        setPreferences(prev => ({
            ...prev,
            twitterLists: prev.twitterLists.filter(l => l !== list),
        }))
    }

    useEffect(() => {
        if (isSuccess) {
            // queryClient.removeQueries({ queryKey: ['alphaFeedData'] });
            // console.log('success update');
            setTimeout(() => {
                // console.log('refresh alpha feed');
                queryClient.refetchQueries({
                    queryKey: ['alphaFeedData'],
                })
            }, 5000)

            toast.success('Alpha feed sources updated successfully.')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess])

    useEffect(() => {
        // console.log({ isError, updateAlphaFeedError });
        if (isError && updateAlphaFeedError) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((updateAlphaFeedError as any).type === 'list') {
                setListsError(updateAlphaFeedError.message)
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((updateAlphaFeedError as any).type === 'user') {
                setAccountsError(updateAlphaFeedError.message)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isError])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    return (
        <Modal ref={modalRef}>
            <div className="max-w-xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full ">
                <div className="p-3 flex border-b border-border items-center bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Alpha Feed Source</div>
                    <div>
                        <XButton
                            onClick={() => {
                                modalRef.current?.closeModal()
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col p-3 max-h-[50vh] overflow-y-auto gap-3">
                    <div className="flex flex-col ">
                        <div className="flex items-center gap-1 pb-2">
                            <div className="text-sm text-neutral-text ">Twitter Accounts</div>
                            <Tooltip text="Twitter account handle">
                                <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                            </Tooltip>
                        </div>
                        <form
                            onSubmit={e => {
                                e.preventDefault()
                                addAccount()
                            }}
                            className="flex items-center gap-2"
                        >
                            <Input value={newAccount} onChange={e => setNewAccount(e.target.value)} inputSymbol="@" placeholder="binance"></Input>

                            <Button type="submit" className="text-xs" height="min-h-10">
                                Add
                            </Button>
                        </form>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {preferences.twitterAccounts.map((account, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between border-border rounded-md border gap-1 bg-table-odd  hover:bg-neutral-900 divide-x divide-border"
                                >
                                    <div className="flex items-center h-6 px-2 text-xs">{account}</div>
                                    <button
                                        onClick={() => removeAccount(account)}
                                        className="text-neutral-text-dark hover:text-red-500 text-2xs flex items-center justify-center size-6"
                                    >
                                        <FaXmark />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {accountsError && (
                            <div className="text-red-500 text-2xs flex flex-col pt-2">
                                <div>{accountsError}</div>{' '}
                                <ul className=" list-disc pl-3">
                                    {updateAlphaFeedError &&
                                        isCustomError(updateAlphaFeedError) &&
                                        updateAlphaFeedError.args &&
                                        updateAlphaFeedError.args.length > 0 &&
                                        updateAlphaFeedError.args.map((args, index) => {
                                            return (
                                                <li key={index} className="list-disc">
                                                    {args}
                                                </li>
                                            )
                                        })}
                                </ul>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col ">
                        <div className="flex items-center gap-1 pb-2">
                            <div className="text-sm text-neutral-text ">Twitter Lists</div>
                            <Tooltip text="Lists must be public and separate each URL with comma">
                                <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                            </Tooltip>
                        </div>

                        <form
                            onSubmit={e => {
                                e.preventDefault()
                                addList()
                            }}
                            className="flex items-center gap-2"
                        >
                            <Input type="number" value={newList} onChange={e => setNewList(e.target.value)} placeholder="1820445201963635053"></Input>

                            <Button type="submit" className="text-xs" height="min-h-10">
                                Add
                            </Button>
                        </form>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {preferences.twitterLists.map((account, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between border-border rounded-md border gap-1 bg-table-odd  hover:bg-neutral-900 divide-x divide-border"
                                >
                                    <div className="flex items-center h-6 px-2 text-xs">{account}</div>
                                    <button
                                        onClick={() => removeList(account)}
                                        className="text-neutral-text-dark hover:text-red-500 text-2xs flex items-center justify-center size-6"
                                    >
                                        <FaXmark />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {listsError && (
                            <div className="text-red-500 text-2xs flex flex-col pt-2">
                                <div>{listsError}</div>{' '}
                                <ul className=" list-disc pl-3">
                                    {updateAlphaFeedError &&
                                        isCustomError(updateAlphaFeedError) &&
                                        updateAlphaFeedError.args &&
                                        updateAlphaFeedError.args.length > 0 &&
                                        updateAlphaFeedError.args.map((args, index) => {
                                            return (
                                                <li key={index} className="list-disc">
                                                    {args}
                                                </li>
                                            )
                                        })}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* <div className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={preferences.showDefaultDataSources}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  showDefaultDataSources: e.target.checked,
                }))
              }
            />
            <div>
              Show default data sources including private and public alpha
              groups
            </div>
          </div> */}

                    <div className="text-xs border border-border rounded-lg p-2">
                        After updating your alpha feed source, please allow up to 5 minutes for the server to process the new data before you can
                        access the latest information.
                    </div>
                </div>
                <div className="flex flex-col w-full p-3 gap-3">
                    <div className="flex items-center justify-end gap-3 text-xs">
                        <Button onClick={handleToggleModal} variant="ghost">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitForm} variant="primary">
                            <span>Save</span>
                            {isPending && <Spinner variant="primary" className="" />}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

AlphaFeedModal.displayName = 'AlphaFeedModal'

export default AlphaFeedModal
