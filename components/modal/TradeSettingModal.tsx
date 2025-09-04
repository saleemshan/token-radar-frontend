'use client'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import Modal, { ModalMethods } from '@/components/modal/Modal'

import { useMutateTradeSettingsData, useTradeSettingsData } from '@/hooks/data/useTradeSettingsData'
import Spinner from '../Spinner'
import { useUser } from '@/context/UserContext'
import { tradeSettings } from '@/data/default/tradeSettings'
import DecimalInput from '../input/DecimalInput'
import Button from '../ui/Button'
import XButton from '../ui/XButton'

const TradeSettingModal = forwardRef((_, ref) => {
    const { mutate, isPending, isSuccess } = useMutateTradeSettingsData()
    const { chain } = useUser()
    const { data } = useTradeSettingsData(chain.api)

    const modalRef = React.createRef<ModalMethods>()
    const slippageOptions = [...tradeSettings[chain.api].slippages]
    const [selectedSlippage, setSelectedSlippage] = useState<number | undefined>(tradeSettings[chain.api].defaultSlippage * 100)
    const [isCustomSlippageActive, setIsCustomSlippageActive] = useState<boolean>(false)
    const [customSlippage, setCustomSlippage] = useState<number | undefined>(0)
    const [errorMessage, setErrorMessage] = useState('')

    const priorityFees = [...tradeSettings[chain.api].priorityFees]

    const [priorityFee, setPriorityFee] = useState(tradeSettings[chain.api].defaultPriorityFee)
    const [isCustomPriorityActive, setIsCustomPriorityActive] = useState<boolean>(false)
    const [customPriority, setCustomPriority] = useState<number | undefined>(0)

    const [antiMev] = useState(tradeSettings[chain.api].antiMev)

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    const handleSaveSetting = async () => {
        setErrorMessage('')
        if (isCustomSlippageActive && !customSlippage) {
            return setErrorMessage('Invalid custom slippage')
        }

        if (customSlippage && customSlippage <= 0) {
            return setErrorMessage('Invalid custom slippage')
        }

        if (isCustomPriorityActive && !customPriority) {
            return setErrorMessage(`Invalid ${chain.id === 'solana' ? 'priority' : 'gas'} fee`)
        }

        if (customPriority && customPriority <= 0) {
            return setErrorMessage(`Invalid ${chain.id === 'solana' ? 'priority' : 'gas'} fee`)
        }

        const finalSlippage = isCustomSlippageActive ? customSlippage : selectedSlippage
        const finalPriorityFee = isCustomPriorityActive ? customPriority : priorityFee

        mutate({
            chain: chain.api,
            slippage: finalSlippage !== undefined && finalSlippage !== null ? finalSlippage / 100 : tradeSettings[chain.api].defaultSlippage,
            priorityFee: finalPriorityFee !== undefined && finalPriorityFee !== null ? finalPriorityFee : tradeSettings[chain.api].defaultPriorityFee,
            antiMev: antiMev,
        })
    }

    useEffect(() => {
        if (isSuccess) {
            handleToggleModal()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess])

    useEffect(() => {
        if (!data) {
            setPriorityFee(tradeSettings[chain.api].defaultPriorityFee)
            setSelectedSlippage(tradeSettings[chain.api].defaultSlippage * 100)
            setIsCustomPriorityActive(false)
            setIsCustomSlippageActive(false)
        }

        if (data && data.slippage !== undefined && data.slippage !== null) {
            if ([...tradeSettings[chain.api].slippages].includes(data.slippage * 100)) {
                setSelectedSlippage(data.slippage * 100)
                setIsCustomSlippageActive(false)
            } else {
                setCustomSlippage(data.slippage * 100)
                setIsCustomSlippageActive(true)
            }
        }

        //priority fee
        if (data && data.priorityFee !== undefined && data.priorityFee !== null) {
            const priorityFeeValues: number[] = tradeSettings[chain.api].priorityFees.map(fee => fee.value)

            if (priorityFeeValues.includes(data.priorityFee)) {
                setPriorityFee(data.priorityFee)
                setIsCustomPriorityActive(false)
            } else {
                setCustomPriority(data.priorityFee)
                setIsCustomPriorityActive(true)
            }
        }
    }, [data, chain])

    return (
        <Modal ref={modalRef}>
            <div className="max-w-xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full ">
                <div className="p-3 flex border-b border-border items-center bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">Trade Setting</div>
                    <div>
                        <XButton onClick={handleToggleModal} />
                    </div>
                </div>
                <div className="flex flex-col p-3 gap-4 max-h-[60vh] overflow-y-auto">
                    <div className="flex flex-col gap-1">
                        <div className="text-sm text-neutral-text font-semibold">Slippage Limit (%)</div>
                        <div className="text-xs pb-2 text-neutral-text-dark">
                            How many fewer tokens are you willing to accept in a trade because of price fluctuations.
                        </div>
                        <div className="text-neutral-text">
                            <div className="flex bg-neutral-950 rounded-lg h-12 text-sm  font-medium border border-border/50">
                                {slippageOptions.map((item, index) => {
                                    return (
                                        <button
                                            onClick={() => {
                                                setIsCustomSlippageActive(false)
                                                setSelectedSlippage(item)
                                                setCustomSlippage(0)
                                            }}
                                            key={index}
                                            type="button"
                                            className={`flex-1 border first:rounded-l-lg last:rounded-r-lg ${
                                                !isCustomSlippageActive && selectedSlippage === item
                                                    ? 'bg-neutral-900  border-border text-neutral-text font-semibold'
                                                    : 'border-transparent text-neutral-text-dark'
                                            }`}
                                        >
                                            {item === 0 ? 'Auto' : `${item}%`}
                                        </button>
                                    )
                                })}
                                <div
                                    className={`relative min-w-32 max-w-32 md:min-w-48 md:max-w-48  h-full  ${
                                        isCustomSlippageActive ? 'font-semibold' : ''
                                    }`}
                                >
                                    <div
                                        className={`absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 ${
                                            isCustomSlippageActive ? 'text-neutral-text' : 'text-neutral-text-dark'
                                        }`}
                                    >
                                        Custom
                                    </div>
                                    <DecimalInput
                                        value={customSlippage ? customSlippage.toString() : ''}
                                        onChange={e => {
                                            setIsCustomSlippageActive(true)
                                            setCustomSlippage(Number(e.target.value))
                                        }}
                                        onFocus={() => {
                                            setIsCustomSlippageActive(true)
                                        }}
                                        className={`h-full w-full rounded-r-lg  focus:ring-0  border pl-[5rem] pr-[2rem]   ${
                                            isCustomSlippageActive
                                                ? 'border-border focus:border-border bg-neutral-900 text-neutral-text font-semibold'
                                                : 'border-transparent text-neutral-text-dark bg-neutral-950'
                                        }`}
                                        placeholder="0.00%"
                                    />
                                    <div className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2">%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col  gap-1">
                        <div className="text-sm text-neutral-text font-semibold">{chain.id === 'solana' ? 'Priority Fee' : 'Gas Fee'}</div>
                        <div className="text-xs pb-2 text-neutral-text-dark">Extra fees to speed up the processing of your transaction.</div>
                        <div className="text-neutral-text">
                            <div className="flex bg-neutral-950 rounded-lg h-14 text-sm border-border/50 border">
                                {priorityFees.map((item, index) => {
                                    return (
                                        <button
                                            onClick={() => {
                                                setIsCustomPriorityActive(false)
                                                setPriorityFee(item.value)
                                                setCustomPriority(0)
                                            }}
                                            key={index}
                                            type="button"
                                            className={`flex-1 border first:rounded-l-lg last:rounded-r-lg ${
                                                !isCustomPriorityActive && priorityFee === item.value
                                                    ? 'bg-neutral-900  border-border text-neutral-text font-semibold'
                                                    : 'border-transparent text-neutral-text-dark'
                                            }`}
                                        >
                                            <div className=" text-xs pb-1">{item.name}</div>
                                            {item.value > 0 && (
                                                <div className="text-xs -mt-[2px]">
                                                    {item.value} {chain.priorityFeeUnit}
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}

                                <div
                                    className={`relative min-w-32 max-w-32 md:min-w-48 md:max-w-48  h-full  ${
                                        isCustomPriorityActive ? 'font-semibold' : ''
                                    }`}
                                >
                                    <div
                                        className={`absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 ${
                                            isCustomPriorityActive ? 'text-neutral-text' : 'text-neutral-text-dark'
                                        }`}
                                    >
                                        Custom
                                    </div>
                                    <DecimalInput
                                        value={customPriority ? customPriority.toString() : ''}
                                        onChange={e => {
                                            setIsCustomPriorityActive(true)
                                            setCustomPriority(Number(e.target.value))
                                        }}
                                        onFocus={() => {
                                            setIsCustomPriorityActive(true)
                                        }}
                                        className={`h-full w-full rounded-r-lg  focus:ring-0  border pl-[5rem] pr-[3rem]   ${
                                            isCustomPriorityActive
                                                ? 'border-border focus:border-border bg-neutral-900 text-neutral-text font-semibold'
                                                : 'border-transparent text-neutral-text-dark bg-neutral-950'
                                        }`}
                                        placeholder="0.00"
                                    />
                                    <div className="absolute -translate-y-1/2 pointer-events-none right-4 top-1/2">{chain.priorityFeeUnit}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {errorMessage && <div className="text-negative text-xs">{errorMessage}</div>}
                    {/* <div className="flex flex-col  gap-1">
            <div className="text-sm text-neutral-text font-semibold">
              Anti MEV
            </div>
            <div className="text-xs pb-2 text-neutral-text-dark">
              Activate this feature to guard against sandwich attacks by MEV
              bots and reduce gas fees in case a transaction fails.
            </div>

            <div className="text-neutral-text">
              <div className="flex bg-neutral-950 rounded-lg h-10 text-sm border-border/50 border">
                <button
                  onClick={() => {
                    setAntiMev(true);
                  }}
                  type="button"
                  className={`flex-1 border first:rounded-l-lg last:rounded-r-lg uppercase ${
                    antiMev === true
                      ? 'border-border bg-neutral-900 text-neutral-text'
                      : 'border-transparent text-neutral-text-dark'
                  }
                   `}
                >
                  <div className="  text-sm font-semibold"> ON</div>
                </button>
                <button
                  onClick={() => {
                    setAntiMev(false);
                  }}
                  type="button"
                  className={`flex-1 border first:rounded-l-lg last:rounded-r-lg uppercase ${
                    antiMev === false
                      ? 'border-border bg-neutral-900 text-neutral-text'
                      : 'border-transparent text-neutral-text-dark'
                  }
                   `}
                >
                  <div className="  text-sm font-semibold"> OFF</div>
                </button>
              </div>
            </div>
          </div> */}

                    <div className="flex items-center justify-end gap-3 text-xs">
                        <Button onClick={handleToggleModal} variant="ghost" height="min-h-9">
                            Cancel
                        </Button>
                        <Button onClick={handleSaveSetting} className="" variant="primary">
                            <span> Save</span>
                            {isPending && <Spinner variant="primary" className="mb-[2px]" />}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

TradeSettingModal.displayName = 'TradeSettingModal'

export default TradeSettingModal
