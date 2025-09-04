'use client'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import Modal, { ModalMethods } from './Modal'
import DecimalInput from '../input/DecimalInput'
// import { useRouter } from 'next/navigation'
import Input from '../Input'
import Button from '../ui/Button'
import XButton from '../ui/XButton'

const StrategyModal = forwardRef((props: { strategy: PresetStrategy | undefined; onStrategyCreate?: () => void }, ref) => {
    const modalRef = React.createRef<ModalMethods>()

    // const router = useRouter()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [inputValues, setInputValues] = useState<
        | {
              displayName: string
              statement: Statement
              placeholder?: string
              inputSymbol?: string
          }[]
        | undefined
    >(undefined)

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    const validateInputValues = () => {
        if (inputValues) {
            for (const statement of inputValues) {
                if (statement.statement.type === 'trade') {
                    if (!statement.statement.amount) return false
                } else {
                    if (!statement.statement.value) return false
                }
            }
        }
        return true
    }

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    useEffect(() => {
        localStorage.removeItem('presetAts')
        if (props.strategy) {
            setInputValues(props.strategy.extraInput)
        }
    }, [props.strategy])

    return (
        <Modal ref={modalRef}>
            {props.strategy !== undefined && (
                <div className="max-w-2xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full ">
                    <div className="p-3 flex border-b border-border items-center bg-black">
                        <div className=" text-base font-semibold leading-6 text-white flex-1 ">{props.strategy.name}</div>
                        <div>
                            <XButton
                                onClick={() => {
                                    modalRef.current?.closeModal()
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col w-full p-3 gap-3">
                        <div className="">{props.strategy.description}</div>

                        <div className="flex flex-col gap-3">
                            {inputValues &&
                                inputValues.length > 0 &&
                                inputValues.map((statement, index) => {
                                    return (
                                        <div className="flex flex-col gap-2" key={index}>
                                            <div className="text-sm">{statement.displayName}</div>
                                            {statement.statement.type === 'trade' ? (
                                                <div className="relative overflow-hidden rounded-lg border  focus:border-border border-border">
                                                    {statement.inputSymbol && (
                                                        <div className="absolute inset-y-0 flex justify-center items-center px-3 border-r border-border bg-table-odd w-10 min-w-10">
                                                            {statement.inputSymbol}
                                                        </div>
                                                    )}
                                                    <DecimalInput
                                                        type="text"
                                                        placeholder={statement.placeholder}
                                                        value={statement.statement.amount}
                                                        onChange={e => {
                                                            statement.statement.amount = e.target.value

                                                            setInputValues([...inputValues])
                                                        }}
                                                        className={`w-full h-full rounded-lg p-2 focus:outline-none text-neutral-text bg-table-odd  text-base focus:bg-neutral-900 ${
                                                            statement.inputSymbol ? 'pl-12' : ''
                                                        }`}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="relative overflow-hidden rounded-lg border  focus:border-border border-border">
                                                    <Input
                                                        inputSymbol={statement.inputSymbol}
                                                        placeholder={statement.placeholder}
                                                        onChange={e => {
                                                            statement.statement.value = e.target.value
                                                            setInputValues([...inputValues])
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Button onClick={handleToggleModal} className="text-xs" variant="ghost">
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                disabled={!validateInputValues()}
                                onClick={() => {
                                    if (!validateInputValues()) {
                                        alert('Please ensure all input fields are filled in.')
                                        return
                                    }

                                    console.log(props.strategy)

                                    localStorage.setItem(
                                        'presetAts',
                                        JSON.stringify({
                                            ...(props.strategy || {}),
                                            extraInput: inputValues,
                                        })
                                    )

                                    // const strategyId = props.strategy ? props.strategy.id : '';
                                    // router.push(`/ats/create?preset=${strategyId}`);
                                    // router.push(`/ats/create`);

                                    if (props.onStrategyCreate) {
                                        props.onStrategyCreate()
                                    }
                                }}
                                type="button"
                                className={`text-xs`}
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    )
})

StrategyModal.displayName = 'StrategyModal'

export default StrategyModal
