import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react'
import Modal, { ModalMethods } from './Modal'
import Input from '../Input'
import { NEWS_TRADING_DEFAULT_BIG_AMOUNT, NEWS_TRADING_DEFAULT_SMALL_AMOUNT } from '@/data/default/tradeSettings'
import Button from '../ui/Button'
import { getNumberWithCommas } from '@/utils/price'

import { toast } from 'react-toastify'
import { ShortcutAction, useKeyboardShortcutContext } from '@/context/KeyboardShortcutContext'
import { useSettingsContext } from '@/context/SettingsContext'
import XButton from '../ui/XButton'
import useHaptic from '@/hooks/useHaptic'

const NewsTradingPresetModal = forwardRef((_, ref) => {
    const { shortcuts } = useKeyboardShortcutContext()
    const { handleToggleSettingsModal } = useSettingsContext()
    const { triggerHaptic } = useHaptic()

    const MAX_LEVERAGE = 20

    const modalRef = React.createRef<ModalMethods>()
    const [newsTradingPreset, setNewsTradingPreset] = useState({
        longBig: NEWS_TRADING_DEFAULT_BIG_AMOUNT,
        longSmall: NEWS_TRADING_DEFAULT_SMALL_AMOUNT,
        shortBig: NEWS_TRADING_DEFAULT_BIG_AMOUNT,
        shortSmall: NEWS_TRADING_DEFAULT_SMALL_AMOUNT,
    })

    const [sliderValue, setSliderValue] = useState<number>(1)
    const [leverageType, setLeverageType] = useState<'normal' | 'degen'>('normal')

    //Slider change handler
    const handleSliderChange = (newValue: number) => {
        triggerHaptic(20)
        if (newValue >= 1) {
            setSliderValue(newValue)
        }
    }

    //Input change handler
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value.replace('x', '')) || 1
        if (value >= 1 && value <= MAX_LEVERAGE) {
            setSliderValue(value)
        }
    }

    const getInputLabel = (key: string) => {
        switch (key) {
            case 'longBig':
                return 'Big Long'
            case 'longSmall':
                return 'Small Long'
            case 'shortBig':
                return 'Big Short'
            case 'shortSmall':
                return 'Small Short'
            default:
                return ''
        }
    }

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    const handleSubmitForm = async () => {
        triggerHaptic(50)
        localStorage.setItem('newsTradingPreset', JSON.stringify({ ...newsTradingPreset, leverage: leverageType === 'normal' ? sliderValue : 'max' }))

        const event = new Event('newsTradingPresetsUpdated')
        window.dispatchEvent(event)

        toast.success('News trading presets updated successfully.')
    }

    const handleNewsTradingPresetChange = (key: string, value: number) => {
        setNewsTradingPreset(prev => ({
            ...prev,
            [key]: value,
        }))
    }

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    useEffect(() => {
        // Retrieve data from local storage
        const storedPreset = localStorage.getItem('newsTradingPreset')
        const parsedPreset = JSON.parse(storedPreset ?? '{}')

        setNewsTradingPreset(
            storedPreset
                ? {
                      longBig: parsedPreset?.longBig,
                      longSmall: parsedPreset?.longSmall,
                      shortBig: parsedPreset?.shortBig,
                      shortSmall: parsedPreset?.shortSmall,
                  }
                : {
                      longBig: NEWS_TRADING_DEFAULT_BIG_AMOUNT,
                      longSmall: NEWS_TRADING_DEFAULT_SMALL_AMOUNT,
                      shortBig: NEWS_TRADING_DEFAULT_BIG_AMOUNT,
                      shortSmall: NEWS_TRADING_DEFAULT_SMALL_AMOUNT,
                  }
        )

        if (parsedPreset?.leverage === 'max') {
            setLeverageType('degen')
        } else {
            setSliderValue(parsedPreset?.leverage ?? 1)
            setLeverageType('normal')
        }

        setSliderValue(parsedPreset?.leverage ?? 1)
    }, [])

    return (
        <Modal ref={modalRef}>
            <form
                onSubmit={e => {
                    e.preventDefault()
                    handleSubmitForm()
                }}
                className="max-w-xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full "
            >
                <div className="p-3 flex border-b border-border items-center bg-black">
                    <div className=" text-base   font-semibold leading-6 text-white flex-1 ">News Trading Preset</div>
                    <div>
                        <XButton
                            onClick={() => {
                                modalRef.current?.closeModal()
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col p-3 pb-3 max-h-[50vh] overflow-y-auto gap-4">
                    <div className="w-full flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <div className="text-sm text-neutral-text font-semibold">Preset</div>
                        </div>
                        <div className="grid grid-cols-2  gap-2">
                            {Object.entries(newsTradingPreset).map(([key]) => {
                                return (
                                    <div className="flex flex-col gap-1" key={key}>
                                        <div className="flex items-center gap-2">
                                            <div className="text-xs text-neutral-text ">{getInputLabel(key)}</div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleToggleSettingsModal('Shortcuts')
                                                }}
                                                className="text-2xs mt-[1px] uppercase"
                                            >
                                                ({shortcuts[key as ShortcutAction]})
                                            </button>
                                        </div>
                                        <Input
                                            value={newsTradingPreset[key as 'longBig' | 'longSmall' | 'shortBig' | 'shortSmall'].toString()}
                                            onChange={e => {
                                                const value = parseInt(e.target.value)
                                                if (value) {
                                                    handleNewsTradingPresetChange(key, value)
                                                } else {
                                                    handleNewsTradingPresetChange(key, 0)
                                                }
                                            }}
                                            inputSymbol="$"
                                            placeholder="1000"
                                            type="text"
                                        ></Input>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-1">
                        <div className="text-sm font-semibold text-neutral-text">Leverage</div>
                        <div className="flex items-center gap-2 mb-2">
                            <Button
                                className="w-full"
                                height="min-h-10 h-10"
                                onClick={() => {
                                    setLeverageType('normal')
                                    setSliderValue(1)
                                }}
                                variant={leverageType === 'normal' ? 'active' : 'inactive'}
                            >
                                Normal
                            </Button>
                            <Button
                                className="w-full"
                                height="min-h-10 h-10"
                                onClick={() => setLeverageType('degen')}
                                variant={leverageType === 'degen' ? 'active' : 'inactive'}
                            >
                                Degen
                            </Button>
                        </div>
                        {leverageType === 'normal' && (
                            <>
                                <div className="text-xs  ">
                                    Leverage will default to the max leverage on tokens where your pre-set leverage is too large and not possible (for
                                    example, defaulting to 5x max leverage if your leverage setting is 10x).
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="range"
                                        className="w-full accent-white"
                                        min="1"
                                        max={40}
                                        value={sliderValue}
                                        onChange={e => handleSliderChange(Number(e.target.value))}
                                    />
                                    <input
                                        type="number"
                                        className="w-14 h-8 text-base border border-border bg-table-odd text-neutral-text rounded-md text-center focus:outline-none focus:border-border focus:bg-neutral-900 transition-colors"
                                        min="1"
                                        value={sliderValue}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </>
                        )}

                        {leverageType === 'degen' && (
                            <div className="text-xs  ">Leverage will be set to the maximum supported by the selected token.</div>
                        )}

                        <div className="text-xs text-negative ">Setting a higher leverage increases the risk of liquidation</div>
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                        <div className="text-sm font-semibold  text-neutral-text">Order Value Confirmation</div>
                        <div className="flex flex-col border-border border p-1 rounded-lg gap-2 bg-neutral-900">
                            <div className="grid grid-cols-2 p-2 gap-2">
                                {leverageType === 'degen' && <div className="col-span-full text-xs">Assume Max Leverage for Selected Token: 20</div>}
                                {Object.entries(newsTradingPreset).map(([key, value]) => {
                                    const slider = leverageType === 'normal' ? sliderValue : 20
                                    const amount = value * slider
                                    return (
                                        <div className="flex flex-col " key={key}>
                                            <div className="flex items-center ">
                                                <div className="text-xs  text-neutral-text font-bold">{getInputLabel(key)}</div>
                                            </div>
                                            <div>{`$${value} x ${slider} = $${getNumberWithCommas(amount)}`}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    {/* <div className="w-full flex flex-col gap-2">
            <div className="text-sm text-neutral-text">Filter</div>
            <div className="flex items-center gap-2">
              <Input
                value={tickerFilter}
                onChange={(e) => setTickerFilter(e.target.value.toUpperCase())}
                inputSymbol=""
                placeholder="Ticker"
              ></Input>

              <button
                onClick={() => {
                  handleAddTokenFilter();
                }}
                type="button"
                className="flex bg-table-odd rounded-lg px-3 h-10  min-h-10 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text border border-border uppercase text-xs font-semibold min-w-fit "
              >
                Add
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {tickerFilters.map((token, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-border rounded-md border gap-1 bg-table-odd  hover:bg-neutral-900 divide-x divide-border"
                >
                  <div className="flex items-center h-6 px-2 text-xs">
                    {token}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTokenFilter(index)}
                    className="text-neutral-text-dark hover:text-red-500 text-2xs flex items-center justify-center size-6"
                  >
                    <FaXmark />
                  </button>
                </div>
              ))}
            </div>
          </div> */}
                </div>

                <div className="flex flex-col w-full p-3 gap-3 border-t border-border">
                    <div className="flex items-center justify-end gap-3 text-xs">
                        <Button onClick={handleToggleModal} variant="ghost">
                            Cancel
                        </Button>
                        <Button onClick={handleSubmitForm} variant="primary">
                            <span>Save</span>
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    )
})

NewsTradingPresetModal.displayName = 'NewsTradingPresetModal'

export default NewsTradingPresetModal
