import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import Modal, { ModalMethods } from './Modal'
import Spinner from '../Spinner'
import Select from 'react-select'
import { customTheme } from '@/data/default/theme'
import Button from '../ui/Button'
import { useMutateNewsFeedPreferencesData, useNewsFeedPreferencesData } from '@/hooks/data/useNewsFeedPreferencesData'
import SubscriptionsSelector from '../SubscriptionsSelector'
import { toast } from 'react-toastify'
import XButton from '../ui/XButton'
import useHaptic from '@/hooks/useHaptic'
import { MultiSelectOption } from '@/types/newstrading'
import { usePairTokensContext } from '@/context/pairTokensContext'
import {
    CATEGORIES,
    IMPACT_SCORES,
    NEWS_SOURCES_DEFAULT,
    NEWS_SOURCES_OPTIONS,
    NEWS_TYPES,
    SENTIMENTS,
    // SOCIAL_SOURCES_DEFAULT,
    // SOCIAL_SOURCES_OPTIONS,
    TRADFI_SOURCES_DEFAULT,
    TRADFI_SOURCES_OPTIONS,
} from '@/data/default/newsTrading'
import Tooltip from '../Tooltip'
import { FaCircleInfo } from 'react-icons/fa6'

const NewsFeedPreferencesModal = forwardRef((_, ref) => {
    const modalRef = React.createRef<ModalMethods>()
    const { triggerHaptic } = useHaptic()

    const { data: newsFeedPreferences, isLoading: isNewsFeedPreferencesLoading } = useNewsFeedPreferencesData()

    const { tokenPairData } = usePairTokensContext()

    const memoizedInitialNewsSources = useMemo(() => newsFeedPreferences?.newsSourceTypes ?? [], [newsFeedPreferences?.newsSourceTypes])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const memoizedInitialSocialSources = useMemo(() => newsFeedPreferences?.socialSourceTypes ?? [], [newsFeedPreferences?.socialSourceTypes])
    const memoizedInitialTradFiSources = useMemo(() => newsFeedPreferences?.tradfiSourceTypes ?? [], [newsFeedPreferences?.tradfiSourceTypes])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mutate, isSuccess, error, isError, isPending } = useMutateNewsFeedPreferencesData()

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedNewsSources, setSelectedNewsSources] = useState<string[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedTradFiSources, setSelectedTradFiSources] = useState<string[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [selectedSocialSources, setSelectedSocialSources] = useState<string[]>([])

    const [filterNewsTypes, setFilterNewsTypes] = useState<MultiSelectOption[]>([])
    const [filterSentimentMomentums, setFilterSentimentMomentums] = useState<MultiSelectOption[]>([])
    const [filterSentimentDirections, setFilterSentimentDirections] = useState<MultiSelectOption[]>([])
    const [filterCategories, setFilterCategories] = useState<MultiSelectOption[]>([])
    const [filterTokens, setFilterTokens] = useState<MultiSelectOption[]>([])
    const [presetTickers, setPresetTickers] = useState<MultiSelectOption[]>([])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [filterNrsActions, setFilterNrsActions] = useState<MultiSelectOption[]>([])
    const [availableTokens, setAvailableTokens] = useState<MultiSelectOption[]>([])

    const [filterHyperliquid, setFilterHyperliquid] = useState(false)

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    const handleSubmitForm = async () => {
        triggerHaptic(50)

        mutate({
            news: {
                types: filterNewsTypes.map(data => data.value),
                categories: filterCategories.map(data => data.value),
                sentimentMomentums: filterSentimentMomentums.map(data => data.value),
                symbol: filterTokens.map(data => data.value),
                presetTickers: presetTickers.map(data => data.value),
                sentimentDirections: filterSentimentDirections.map(data => data.value),
                filterHyperliquid,
                nrsActions: filterNrsActions.map(data => data.value),
            },
            newsSourceTypes: selectedNewsSources,
            tradfiSourceTypes: selectedTradFiSources,
            socialSourceTypes: selectedSocialSources,
        })
    }

    useEffect(() => {
        if (isSuccess) {
            setTimeout(() => {
                window.dispatchEvent(new Event('newsTradingFiltersUpdated'))
            }, 1000)
            toast.success('News feed preferences updated successfully.')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess])

    useEffect(() => {
        if (isError) {
            console.log({ error })
            toast.error('Something went wrong, try again later.')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isError])

    useEffect(() => {
        if (tokenPairData && tokenPairData.length > 0) {
            const availableTokens: MultiSelectOption[] = tokenPairData.map(data => {
                return {
                    label: data.universe.name,
                    value: data.universe.name,
                } as MultiSelectOption
            })
            setAvailableTokens(availableTokens)
        }
    }, [tokenPairData])

    useEffect(() => {
        if (newsFeedPreferences && newsFeedPreferences.news) {
            if (newsFeedPreferences.news.symbol) {
                const filterTokens = newsFeedPreferences.news.symbol.map((data: string) => {
                    return {
                        label: data,
                        value: data,
                    } as MultiSelectOption
                })
                setFilterTokens(filterTokens)
            }
            if (newsFeedPreferences.news.presetTickers) {
                const tickers = newsFeedPreferences.news.presetTickers.map((data: string) => {
                    return {
                        label: data,
                        value: data,
                    } as MultiSelectOption
                })
                setPresetTickers(tickers)
            }
            if (newsFeedPreferences.news.categories) {
                const categories = newsFeedPreferences.news.categories.map((data: string) => {
                    return {
                        label: data,
                        value: data,
                    } as MultiSelectOption
                })
                setFilterCategories(categories)
            }
            if (newsFeedPreferences.news.sentimentMomentums) {
                const sentimentMomentums = newsFeedPreferences.news.sentimentMomentums.map((data: string) => {
                    return {
                        label: data,
                        value: data,
                    } as MultiSelectOption
                })
                setFilterSentimentMomentums(sentimentMomentums)
            }
            if (newsFeedPreferences.news.sentimentDirections) {
                const sentimentDirections = newsFeedPreferences.news.sentimentDirections.map((data: string) => {
                    return {
                        label: data,
                        value: data,
                    } as MultiSelectOption
                })
                setFilterSentimentDirections(sentimentDirections)
            }
            if (newsFeedPreferences.news.types) {
                const newsTypes = newsFeedPreferences.news.types.map((data: string) => {
                    //get from NEWS_TYPES where value is the same
                    const type = NEWS_TYPES.find(type => type.value === data)
                    if (type) {
                        return {
                            label: type.label,
                            value: type.value,
                        } as MultiSelectOption
                    } else {
                        return {
                            label: data,
                            value: data,
                        } as MultiSelectOption
                    }
                })
                setFilterNewsTypes(newsTypes)
            }
            if (newsFeedPreferences.news.filterHyperliquid) {
                setFilterHyperliquid(newsFeedPreferences.news.filterHyperliquid)
            }
            if (newsFeedPreferences.news.nrsActions) {
                const nrsActions = newsFeedPreferences.news.nrsActions.map((data: string) => {
                    return {
                        label: data,
                        value: data,
                    } as MultiSelectOption
                })
                setFilterNrsActions(nrsActions)
            }
            if (newsFeedPreferences.news.filterHyperliquid) {
                setFilterHyperliquid(newsFeedPreferences.news.filterHyperliquid)
            }
        }
    }, [newsFeedPreferences])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    return (
        <Modal ref={modalRef}>
            <div className="max-w-2xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full  max-h-[80vh]">
                <div className="p-3 flex border-b border-border items-center bg-black">
                    <div className=" text-base font-semibold leading-6 text-white flex-1 ">News Feed Filter</div>
                    <div>
                        <XButton
                            onClick={() => {
                                modalRef.current?.closeModal()
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col overflow-y-auto divide-y divide-border">
                    <div className="flex flex-col gap-3 p-3">
                        <div className="text-sm font-semibold text-nowrap">Crypto</div>
                        <div className="flex flex-col gap-3">
                            {/* <div className="w-full flex flex-col gap-1 col-span-2">
                                <div className="text-xs text-neutral-text">Type</div>
                                {isNewsFeedPreferencesLoading ? (
                                    <Spinner />
                                ) : (
                                    <Select
                                        isDisabled={isNewsFeedPreferencesLoading}
                                        isMulti
                                        name="newsTypes"
                                        options={NEWS_TYPES}
                                        theme={customTheme}
                                        value={filterNewsTypes}
                                        onChange={e => {
                                            setFilterNewsTypes(e as MultiSelectOption[])
                                        }}
                                    />
                                )}
                            </div> */}
                            <div className="w-full flex flex-col gap-1 col-span-2">
                                <div className="text-xs text-neutral-text">Tokens</div>
                                {isNewsFeedPreferencesLoading ? (
                                    <Spinner />
                                ) : (
                                    <Select
                                        isDisabled={isNewsFeedPreferencesLoading}
                                        isMulti
                                        name="tokens"
                                        options={availableTokens}
                                        theme={customTheme}
                                        value={filterTokens}
                                        onChange={e => {
                                            setFilterTokens(e as MultiSelectOption[])
                                        }}
                                    />
                                )}
                            </div>
                            <div className="w-full flex flex-col gap-1 col-span-2">
                                <div className="text-xs text-neutral-text">Impact</div>
                                {isNewsFeedPreferencesLoading ? (
                                    <Spinner />
                                ) : (
                                    <Select
                                        isDisabled={isNewsFeedPreferencesLoading}
                                        isMulti
                                        value={filterSentimentMomentums}
                                        name="impactScores"
                                        options={IMPACT_SCORES}
                                        theme={customTheme}
                                        onChange={e => {
                                            setFilterSentimentMomentums(e as MultiSelectOption[])
                                        }}
                                    />
                                )}
                            </div>
                            <div className="w-full flex flex-col gap-1 col-span-2">
                                <div className="text-xs text-neutral-text">Sentiment</div>
                                {isNewsFeedPreferencesLoading ? (
                                    <Spinner />
                                ) : (
                                    <Select
                                        isDisabled={isNewsFeedPreferencesLoading}
                                        isMulti
                                        value={filterSentimentDirections}
                                        name="impactScores"
                                        options={SENTIMENTS}
                                        theme={customTheme}
                                        onChange={e => {
                                            setFilterSentimentDirections(e as MultiSelectOption[])
                                        }}
                                    />
                                )}
                            </div>
                            <div className="w-full flex flex-col gap-1 col-span-2">
                                <div className="text-xs text-neutral-text">Categories</div>
                                {isNewsFeedPreferencesLoading ? (
                                    <Spinner />
                                ) : (
                                    <Select
                                        isDisabled={isNewsFeedPreferencesLoading}
                                        isMulti
                                        name="categories"
                                        options={CATEGORIES}
                                        value={filterCategories}
                                        theme={customTheme}
                                        onChange={e => {
                                            setFilterCategories(e as MultiSelectOption[])
                                        }}
                                    />
                                )}
                            </div>

                            {/* <div className="w-full flex flex-col gap-1 col-span-2">
                <div className="text-xs text-neutral-text">NRS Momentum</div>
                {isNewsFeedPreferencesLoading ? (
                    <Spinner />
                ) : (
                    <Select
                        isDisabled={isNewsFeedPreferencesLoading}
                        isMulti
                        name="nrsActions"
                        options={NRS_ACTIONS}
                        value={filterNrsActions}
                        theme={customTheme}
                        onChange={e => {
                            setFilterNrsActions(e as MultiSelectOption[])
                        }}
                    />
                )}
            </div> */}
                        </div>

                        <div className="w-full flex flex-col gap-1 col-span-2">
                            <div className="text-xs text-neutral-text">Source</div>
                            <SubscriptionsSelector
                                initialSelectedAccounts={memoizedInitialNewsSources}
                                accountList={NEWS_SOURCES_OPTIONS}
                                defaultList={NEWS_SOURCES_DEFAULT}
                                onSelectedAccountsChange={setSelectedNewsSources}
                            ></SubscriptionsSelector>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 p-3">
                        <div className="text-sm font-semibold">TradFi</div>

                        <div className="w-full flex flex-col gap-1 col-span-2">
                            <div className="text-xs text-neutral-text">Source</div>
                            <SubscriptionsSelector
                                initialSelectedAccounts={memoizedInitialTradFiSources}
                                accountList={TRADFI_SOURCES_OPTIONS}
                                defaultList={TRADFI_SOURCES_DEFAULT}
                                onSelectedAccountsChange={setSelectedTradFiSources}
                            ></SubscriptionsSelector>
                        </div>
                    </div>

                    {/* <div className="flex flex-col gap-2 p-3">
                        <div className="text-sm font-semibold">Twitter/X</div>

                        <div className="w-full flex flex-col gap-1 col-span-2">
                            <div className="text-xs text-neutral-text">Source</div>
                            <SubscriptionsSelector
                                initialSelectedAccounts={memoizedInitialSocialSources}
                                accountList={SOCIAL_SOURCES_OPTIONS}
                                defaultList={SOCIAL_SOURCES_DEFAULT}
                                onSelectedAccountsChange={setSelectedSocialSources}
                                customInput={false}
                            ></SubscriptionsSelector>
                        </div>
                    </div> */}

                    {/* <div className="text-xs border border-border rounded-lg p-2 mb-3">
                        After updating your news source, please allow up to 5 minutes for the server to process the new data before you can access the
                        latest information.
                    </div> */}

                    <div className="flex flex-col gap-2 p-3">
                        <div className="text-sm font-semibold">Extra</div>

                        <div className="w-full flex flex-col gap-1 col-span-2">
                            <div className="flex items-center gap-1">
                                <div className="text-xs text-neutral-text">Preset Tickers</div>
                                <Tooltip text={`The tickers set will always appear in every the news`}>
                                    <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                </Tooltip>
                            </div>

                            {isNewsFeedPreferencesLoading ? (
                                <Spinner />
                            ) : (
                                <Select
                                    isDisabled={isNewsFeedPreferencesLoading}
                                    isMulti
                                    name="tokens"
                                    options={availableTokens}
                                    theme={customTheme}
                                    value={presetTickers}
                                    onChange={e => {
                                        setPresetTickers(e as MultiSelectOption[])
                                    }}
                                />
                            )}
                        </div>

                        <div className="w-full flex flex-col gap-1 col-span-2">
                            <div className="flex flex-col gap-2 w-full">
                                {/* <div className="flex items-center gap-1">
                                    <div className="text-xs text-neutral-text">Show Tradable Token</div>
                                    <Tooltip text={`The tickers set will always appear in every the news`}>
                                        <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                    </Tooltip>
                                </div> */}
                                {/* <div className="text-xs text-neutral-text">Show Tradable Token</div> */}
                                <div className=" flex items-center gap-1 col-span-2">
                                    {isNewsFeedPreferencesLoading ? (
                                        <Spinner />
                                    ) : (
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-neutral-text-dark"
                                            checked={filterHyperliquid}
                                            onChange={e => {
                                                setFilterHyperliquid(e.target.checked)
                                            }}
                                        />
                                    )}
                                    <div className="text-xs text-neutral-text">Only show news with tradeable tokens</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col w-full p-3 gap-3 border-t border-border">
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

NewsFeedPreferencesModal.displayName = 'NewsFeedPreferencesModal'

export default NewsFeedPreferencesModal
