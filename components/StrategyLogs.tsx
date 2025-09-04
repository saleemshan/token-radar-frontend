import React from 'react'
import TextLoading from './TextLoading'
import { getSimplifyStrategyKeyString, getUppercaseFirstLetter } from '@/utils/string'
import TimeInterval from './TimeInterval'
import Accordion from './Accordion'
import Image from 'next/image'
import { getSlicedAddress } from '@/utils/crypto'
import { getNumberWithCommas, getReadableNumber } from '@/utils/price'
import { getChainImage, TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import Tag, { TagVariant } from './Tag'
import { getExplorerUrl } from '@/data/default/chains'
import Link from 'next/link'
import { FaExternalLinkAlt } from 'react-icons/fa'
import { useSettingsContext } from '@/context/SettingsContext'
import EmptyData from './global/EmptyData'

const TokenInfo = ({
    data,
    amount,
    usdAmount,
    chain,
    label,
}: {
    data: ActivityTokenInfo
    chain: ChainId
    label: string
    amount?: number
    usdAmount?: number
}) => {
    if (data)
        return (
            <div className="flex flex-col gap-1 w-full border rounded-md border-border p-3 bg-table-odd overflow-hidden max-w-full">
                <div className="text-2xs md:text-xs text-neutral-text-dark">{label}</div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 jus">
                        <div className=" min-w-12 min-h-12 max-w-12 max-h-12 rounded-full border border-border relative flex items-center justify-center ">
                            <Image
                                src={`${data?.image ?? TOKEN_PLACEHOLDER_IMAGE}`}
                                alt={` logo`}
                                width={200}
                                height={200}
                                className="rounded-full"
                            />

                            <div className="absolute w-4 h-4 min-w-4 min-h-4 flex items-center justify-center  overflow-hidden rounded-full border border-border bottom-0 -right-[6px] p-[2px] bg-black">
                                <Image
                                    src={getChainImage(chain as ChainId)}
                                    alt={`${data.name} logo`}
                                    width={20}
                                    height={20}
                                    className="rounded-full w-full h-full object-contain object-center"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="text-sm">{data.symbol}</div>
                            <div className="text-xs text-neutral-text-dark">{getSlicedAddress(data.address, undefined, '-')}</div>
                        </div>
                    </div>
                    {amount && usdAmount && (
                        <div className="flex flex-col items-end">
                            <div className="text-negative text-xs">{`-${amount} ${data?.symbol}`}</div>
                            <div className="text-neutral-text-dark text-2xs">{`${getReadableNumber(usdAmount, 2, '$')}`}</div>
                        </div>
                    )}
                </div>
            </div>
        )
}

const StrategyLogs = ({ isLoading, atsData }: { isLoading: boolean; atsData: Strategy }) => {
    const { timezone } = useSettingsContext()

    const excludeUpdateKey = ['isNewsTrading', 'logs', 'isPerps']

    const isTradeLog = (log: IndividualStrategyLog): log is TradeLog => {
        return log.type === 'trade'
    }
    const isUpdateLog = (log: IndividualStrategyLog): log is UpdateLog => {
        return log.type === 'update'
    }

    if (atsData)
        return (
            <div className="p-3 h-full   overflow-y-auto flex flex-col gap-3 pb-3  flex-1">
                {isLoading ? (
                    <>
                        {Array.from({ length: 10 }).map((_, index) => {
                            return <TextLoading key={index} className="w-full" />
                        })}
                    </>
                ) : (
                    <>
                        {atsData && atsData.logs && atsData.logs.length > 0 ? (
                            atsData.logs.map((data: IndividualStrategyLog) => {
                                return (
                                    <div key={data._id} className="border border-border rounded-lg flex flex-col p-3 gap-2">
                                        <div className="flex items-start gap-3 justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="font-semibold">{`${data.type ? getUppercaseFirstLetter(data.type) : ''} ${
                                                    data.type === 'update' ? 'Strategy' : ''
                                                }`}</div>

                                                {isTradeLog(data) && data.status && (
                                                    <Tag variant={data.status as TagVariant}>
                                                        <div className="flex items-center">
                                                            <span> {getUppercaseFirstLetter(data.status)}</span>

                                                            {isTradeLog(data) && data.extraData.errorType && (
                                                                <span className="text-[10px] text-negative ml-1">{data.extraData.errorType}</span>
                                                            )}
                                                        </div>
                                                    </Tag>
                                                )}
                                            </div>
                                            <TimeInterval
                                                initialTime={data.createdAt}
                                                className="min-w-fit text-2xs text-neutral-text-dark"
                                                timezone={timezone}
                                            />
                                        </div>

                                        {data.type === 'trade' && isTradeLog(data) && (
                                            <>
                                                {atsData.isPerps ? (
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex flex-col gap-1">
                                                            <div className="text-xs">
                                                                {data?.symbol} @ {getReadableNumber(data?.price, 2, '$')}
                                                            </div>
                                                            <div className="text-xs">
                                                                Amount: ${getNumberWithCommas(data.usdValue)} ({data.amount}{' '}
                                                                {data.symbol.split('/')[0]})
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col md:flex-row gap-3">
                                                        {'fromTokenInfo' in data.extraData && (
                                                            <TokenInfo
                                                                data={data.extraData.fromTokenInfo}
                                                                amount={data.amount}
                                                                usdAmount={data.usdValue}
                                                                chain={data.extraData.chain as ChainId}
                                                                label="From"
                                                            />
                                                        )}
                                                        {'toTokenInfo' in data.extraData && (
                                                            <TokenInfo
                                                                data={data.extraData.toTokenInfo}
                                                                chain={data.extraData.chain as ChainId}
                                                                label="To"
                                                            />
                                                        )}
                                                    </div>
                                                )}

                                                {data.extraData?.newsInfo && (
                                                    <Accordion title={'News'} className="text-xs">
                                                        <div className="flex flex-col  rounded-lg p-3 gap-1 w-full">
                                                            <div className="text-xs pb-1">{data.extraData.newsInfo?.headline}</div>
                                                            <div className="text-xs ">Direction: {data.extraData.newsInfo?.sentimentDirection}</div>
                                                            <div className="text-xs ">Momentum: {data.extraData.newsInfo?.sentimentMomentum}</div>
                                                        </div>
                                                    </Accordion>
                                                )}

                                                <div className="flex items-center gap-2">
                                                    {'txResult' in data.extraData && data.extraData.chain && data.extraData.txResult.txid && (
                                                        <Link
                                                            href={getExplorerUrl(data.extraData.chain as ChainId, data.extraData.txResult.txid)}
                                                            target="_blank"
                                                            className="flex leading-none  items-center gap-1 border border-border rounded-full py-[5px] px-2 text-neutral-text-dark hover:text-neutral-text hover:bg-table-odd text-2xs"
                                                        >
                                                            <span>Explorer</span>
                                                            <FaExternalLinkAlt />
                                                        </Link>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {data.type === 'update' && isUpdateLog(data) && (
                                            <>
                                                <div className="flex flex-col gap-2">
                                                    {data.updatedFields &&
                                                        data.updatedFields.length > 0 &&
                                                        data.updatedFields.map((field, index) => {
                                                            if (!excludeUpdateKey.includes(field))
                                                                return (
                                                                    <Accordion
                                                                        key={index}
                                                                        title={getSimplifyStrategyKeyString(field)}
                                                                        className="text-xs"
                                                                    >
                                                                        <div className="flex flex-col md:flex-row divide-border divide-y md:divide-x md:divide-y-0  w-full">
                                                                            <div className="w-full md:w-1/2 overflow-hidden flex flex-col flex-1 gap-2  h-full p-3 justify-between">
                                                                                <div className="text-xs text-neutral-text-dark">From</div>
                                                                                <pre className=" whitespace-pre-wrap">{`${JSON.stringify(
                                                                                    data.oldValue[field],
                                                                                    null,
                                                                                    2
                                                                                )}`}</pre>
                                                                            </div>

                                                                            <div className="w-full md:w-1/2 overflow-hidden flex flex-col gap-2 h-full p-3 justify-between">
                                                                                <div className="text-xs text-neutral-text-dark">To</div>
                                                                                <pre className=" whitespace-pre-wrap">{`${JSON.stringify(
                                                                                    data.newValue[field],
                                                                                    null,
                                                                                    2
                                                                                )}`}</pre>
                                                                            </div>
                                                                        </div>
                                                                    </Accordion>
                                                                )
                                                        })}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <EmptyData text="No logs found." />
                        )}
                    </>
                )}
            </div>
        )
}

export default StrategyLogs
