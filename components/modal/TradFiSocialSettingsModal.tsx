import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import Modal, { ModalMethods } from './Modal'
import { validateTwitterUsernames } from '@/utils/string'
import {
    TradFiSocialPreferencesError,
    useMutateTradFiSocialPreferencesData,
    useTradFiSocialPreferencesData,
} from '@/hooks/data/useTradFiSocialPreferencesData'
import Spinner from '../Spinner'
import Button from '../ui/Button'
import { useTradFiSocialAccountsListData } from '@/hooks/data/useTradFiSocialAccountListData'

import SubscriptionsSelector from '../SubscriptionsSelector'
import { toast } from 'react-toastify'
import XButton from '../ui/XButton'
import useHaptic from '@/hooks/useHaptic'

const TradFiSocialSettingsModal = forwardRef((_, ref) => {
    const modalRef = React.createRef<ModalMethods>()
    const [accountsError, setAccountsError] = useState<undefined | string>(undefined)

    const { triggerHaptic } = useHaptic()
    const { data: tradFiPreferencesData } = useTradFiSocialPreferencesData()
    const { data: tradFiSocialAccountsListData } = useTradFiSocialAccountsListData()

    const memoizedInitialTwitterAccounts = useMemo(() => tradFiPreferencesData?.twitterAccounts ?? [], [tradFiPreferencesData?.twitterAccounts])

    const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])

    const { mutate, isPending, isSuccess, isError, error: updateAlphaFeedError } = useMutateTradFiSocialPreferencesData()

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isCustomError = (error: any): error is TradFiSocialPreferencesError => {
        return error instanceof TradFiSocialPreferencesError
    }

    const handleSubmitForm = async () => {
        triggerHaptic(50)
        setAccountsError(undefined)

        let validInput = true

        const updatedPreferences = {
            twitterAccounts: selectedAccounts,
        }

        if (
            updatedPreferences.twitterAccounts.length > 0 &&
            !updatedPreferences.twitterAccounts.every(account => validateTwitterUsernames(account))
        ) {
            setAccountsError(`Twitter accounts need to be valid usernames.`)
            validInput = false
        }

        if (!validInput) return

        mutate(updatedPreferences)
    }

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                window.dispatchEvent(new Event('tradFiSettingsUpdated'))
            }, 1000)

            toast.success('Social sources updated successfully.')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess])

    useEffect(() => {
        if (isError && updateAlphaFeedError) {
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
            <div className="max-w-2xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full ">
                <div className="p-3 flex border-b border-border items-center bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Social Sources </div>
                    <div>
                        <XButton
                            onClick={() => {
                                modalRef.current?.closeModal()
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col p-3 pb-0 overflow-y-auto gap-3">
                    <SubscriptionsSelector
                        initialSelectedAccounts={memoizedInitialTwitterAccounts}
                        accountList={tradFiSocialAccountsListData?.accounts ?? []}
                        defaultList={tradFiSocialAccountsListData?.defaultAccounts ?? []}
                        onSelectedAccountsChange={setSelectedAccounts}
                    ></SubscriptionsSelector>

                    {accountsError && (
                        <div className="text-primary text-2xs flex flex-col">
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

                    <div className="text-xs border border-border rounded-lg p-2">
                        After updating your social source, please allow up to 5 minutes for the server to process the new data before you can access
                        the latest information.
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

TradFiSocialSettingsModal.displayName = 'TradFiSocialSettingsModal'

export default TradFiSocialSettingsModal
