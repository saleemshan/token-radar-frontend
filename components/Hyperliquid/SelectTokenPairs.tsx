import React, { memo, useMemo, useState } from 'react'
import { HiChevronDown } from 'react-icons/hi2'
import TokenPairsInfoTable from './SelectTokenPairTable'
import { useWebDataContext } from '@/context/webDataContext'
import { usePairTokensContext } from '@/context/pairTokensContext'
import Image from 'next/image'
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { findCoinFromMarketDataByCoinId } from '@/utils/tokenSymbol'

const SelectTokenPairs = () => {
    const { activeSpotAssetCtx, activePrepAssetCtx, isSpotToken, loadingActiveAsset } = usePairTokensContext()
    const { marketData, loadingMarketData } = useWebDataContext()

    const [showTokenPairsInfoTable, setShowTokenPairsInfoTable] = useState(false)

    const activeSpotAsset = useMemo(() => {
        return findCoinFromMarketDataByCoinId(marketData, activeSpotAssetCtx?.coin ?? '')
    }, [marketData, activeSpotAssetCtx?.coin])

    return (
        <>
            <div className="flex items-center justify-center relative w-fit">
                <button
                    data-token-pairs-toggle
                    onClick={e => {
                        e.stopPropagation()
                        setShowTokenPairsInfoTable(!showTokenPairsInfoTable)
                    }}
                    className="flex items-center gap-2 bg-background-light hover:bg-background-lighter rounded-lg  transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <div className="leading-4 font-semibold text-white text-ellipsis text-nowrap overflow-hidden max-w-32 text-xs">
                            {loadingMarketData || loadingActiveAsset ? (
                                <div className="w-20 h-4 bg-border animate-pulse rounded"></div>
                            ) : !isSpotToken ? (
                                <div className="flex items-center gap-2">
                                    <TokenImage
                                        imageUrl={`https://app.hyperliquid.xyz/coins/${activePrepAssetCtx?.coin}.svg`}
                                        symbol={activePrepAssetCtx?.coin ?? ''}
                                    />
                                    {activePrepAssetCtx?.coin}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <TokenImage
                                        imageUrl={`https://app.hyperliquid.xyz/coins/${activeSpotAsset?.base}_USDC.svg`}
                                        symbol={activeSpotAsset?.symbol ?? ''}
                                    />

                                    {activeSpotAsset?.symbol}
                                </div>
                            )}
                        </div>
                    </div>
                    <HiChevronDown
                        className={`text-neutral-text-dark w-4 h-4 transition-transform duration-200 ease-in-out ${
                            showTokenPairsInfoTable ? 'rotate-180' : ''
                        }`}
                    />
                </button>
            </div>

            <TokenPairsInfoTable
                tableIsOpen={showTokenPairsInfoTable}
                handleClose={() => setShowTokenPairsInfoTable(false)}
                className="absolute top-[45px] left-0 right-0 z-[100] w-full max-h-[34vh] overflow-hidden flex flex-col"
            />
        </>
    )
}

const TokenImage = memo(({ imageUrl, symbol }: { imageUrl: string; symbol: string }) => {
    const [imageError, setImageError] = useState(false)

    return (
        <Image
            priority
            src={imageError ? TOKEN_PLACEHOLDER_IMAGE : imageUrl}
            alt={symbol}
            width={16}
            height={16}
            suppressHydrationWarning
            unoptimized
            style={{
                backgroundColor: 'white',
            }}
            className="rounded-full min-w-5 min-h-5  max-w-5 max-h-5 overflow-hidden"
            onError={() => {
                setImageError(true)
            }}
        />
    )
})

TokenImage.displayName = 'TokenImage'

export default SelectTokenPairs
