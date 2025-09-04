import React, { useRef, useState } from 'react'
import { FaCheck, FaXmark } from 'react-icons/fa6'
// import PrimaryButton from '@/components/PrimaryButton';
// import { QRCodeSVG } from 'qrcode.react';
// import { useUser } from '@/context/UserContext';
import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import PercentageChange from '../PercentageChange'
import html2canvas from 'html2canvas'
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { getTokenSymbolAbbreviation } from '@/utils/string'
import Button from '../ui/Button'
import useHaptic from '@/hooks/useHaptic'

const ShareTokenModal = ({
    tokenData,
    tokenSecurityData,
    latestTokenPrice,
    latestTokenMcap,
    handleCloseModal,
}: {
    tokenData?: Token
    tokenSecurityData?: TokenSecurity
    latestTokenPrice?: number
    latestTokenMcap?: number
    handleCloseModal: () => void
}) => {
    const { triggerHaptic } = useHaptic()
    const [isCopying, setIsCopying] = useState(false)
    // const { userReferralLink } = useUser();
    const captureRef = useRef<HTMLDivElement | null>(null)

    const handleSaveImage = async () => {
        if (captureRef.current) {
            triggerHaptic(50)
            try {
                setIsCopying(true)
                const canvas = await html2canvas(captureRef.current, {
                    useCORS: true,
                    scale: 4,
                })
                const dataUrl = canvas.toDataURL('image/png')
                const image = new Image()
                image.src = dataUrl
                image.onload = async () => {
                    // Create a canvas to draw the image
                    const offscreenCanvas = document.createElement('canvas')
                    offscreenCanvas.width = image.width
                    offscreenCanvas.height = image.height
                    const ctx = offscreenCanvas.getContext('2d')
                    if (ctx) {
                        ctx.drawImage(image, 0, 0)

                        // Copy the image to the clipboard
                        offscreenCanvas.toBlob(async blob => {
                            if (blob) {
                                const item = new ClipboardItem({ 'image/png': blob })
                                await navigator.clipboard.write([item])
                                console.log('Image copied to clipboard')

                                setIsCopying(false)
                            } else {
                                console.error('Could not create blob from canvas')
                            }
                        }, 'image/png')
                    }
                }
                // const link = document.createElement('a');
                // if (link) {
                //   link.href = dataUrl;
                //   link.download = 'share-image.png';
                //   document.body.appendChild(link);
                //   link.click();
                //   document.body.removeChild(link);
                // }
            } catch (error) {
                setIsCopying(false)
                console.error('Could not generate image', error)
            }
        } else {
            console.error('Element not found')
        }
    }

    return (
        <div
            onClick={e => {
                if (e.currentTarget === e.target) {
                    handleCloseModal()
                }
            }}
            className="fixed z-[53] inset-0 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur p-4"
        >
            <div className=" max-w-lg w-full flex flex-col gap-3 border border-border bg-black p-3 rounded-xl">
                <div className="flex-1 flex flex-col w-full border border-border rounded-lg overflow-hidden">
                    <div
                        ref={captureRef}
                        className="flex flex-col  h-full flex-1  max-h-[80vh] overflow-y-auto bg-black w-full max-w-lgmin-h-[400px] mx-auto"
                    >
                        <div className="w-full flex flex-col relative">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-60 bg-no-repeat"
                                style={{
                                    backgroundImage: "url('/images/wave.jpg')",
                                }}
                            ></div>
                            <div className="flex items-center justify-between p-3 relative">
                                <div
                                    className="bg-contain bg-center w-[4.5rem] h-8 max-w-[4.5rem] max-h-8 bg-no-repeat"
                                    style={{
                                        backgroundImage: "url('/images/brand/logo-wordmark.svg')",
                                    }}
                                ></div>

                                <div className="text-2xs italic">crush.xyz</div>
                            </div>
                            <div className=" px-3 py-3 flex items-center gap-3 relative">
                                <div className="relative">
                                    <div
                                        className="bg-contain bg-center bg-no-repeat size-10 border border-border rounded-full flex items-center justify-center overflow-hidden"
                                        style={{
                                            backgroundImage: `url('${tokenData?.image.icon ?? TOKEN_PLACEHOLDER_IMAGE}')`,
                                        }}
                                    ></div>
                                </div>

                                <div className="flex flex-col gap-1">
                                    <div className=" text-2xs font-semibold  text-neutral-text-dark leading-none">{tokenData?.name}</div>
                                    <div className=" text-sm font-semibold  text-neutral-text leading-none flex items-center gap-1">
                                        <span>{tokenData?.symbol}</span>
                                        <span>/</span>
                                        <span>{getTokenSymbolAbbreviation(tokenData?.chain_id)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 justify-between px-3 py-3">
                            <div className=" text-3xl font-bold  text-neutral-text">
                                {latestTokenPrice
                                    ? getReadableNumber(latestTokenPrice, countDecimalPlaces(latestTokenPrice), '$')
                                    : getReadableNumber(
                                          tokenData?.market_data?.current_price?.usd ?? 0,
                                          countDecimalPlaces(tokenData?.market_data?.current_price?.usd ?? 0),
                                          '$'
                                      )}
                            </div>
                        </div>

                        <div className=" flex flex-wrap px-3 pb-3 gap-2">
                            {tokenSecurityData?.metrics &&
                                tokenSecurityData.metrics.length > 0 &&
                                tokenSecurityData.metrics.map((metric, index) => {
                                    // if (metric.name === 'Top 10 Holders High Ownership')
                                    return (
                                        <div
                                            key={`${index}`}
                                            className={`flex items-center gap-1 relative overflow-hidden min-h-fit  border rounded-md px-1 py-[3px] text-2xs ${
                                                metric.pass ? 'text-positive border-positive' : 'text-negative border-negative'
                                            }`}
                                        >
                                            {metric.pass ? <FaCheck className="text-positive" /> : <FaXmark className="text-negative" />}
                                            <div className={`leading-none mb-1`}>{metric.name}</div>
                                        </div>
                                    )
                                })}
                        </div>

                        <div className="flex flex-col  px-3 pb-3">
                            <div className="flex justify-between gap-3">
                                <div className=" text-neutral-text-dark text-xs ">Market Cap</div>
                                <div className=" text-sm  text-neutral-text">
                                    {latestTokenMcap
                                        ? getReadableNumber(latestTokenMcap, undefined, '$')
                                        : getReadableNumber(tokenData?.market_data?.market_cap?.usd, undefined, '$')}
                                </div>
                            </div>

                            <div className="flex justify-between gap-3">
                                <div className=" text-neutral-text-dark text-xs ">24H Volume</div>
                                <div className=" text-sm  text-neutral-text">
                                    {getReadableNumber(tokenData?.market_data.volume['24h'], undefined, '$')}
                                </div>
                            </div>
                            <div className="flex justify-between gap-3">
                                <div className=" text-neutral-text-dark text-xs ">Liquidity</div>
                                <div className=" text-sm  text-neutral-text">
                                    {getReadableNumber(tokenData?.market_data.liquidity, undefined, '$')}
                                </div>
                            </div>
                            <div className="flex justify-between gap-3">
                                <div className=" text-neutral-text-dark text-xs ">FDV</div>
                                <div className=" text-sm  text-neutral-text">{getReadableNumber(tokenData?.market_data.fdv, undefined, '$')}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 px-3">
                            {['5m', '1h', '6h', '24h'].map(timeFrame => {
                                return (
                                    <div
                                        key={timeFrame}
                                        className={`flex flex-col items-center justify-center border p-1 py-2 rounded-lg bg-black border-border`}
                                    >
                                        <div className="text-2xs leading-none">{timeFrame}</div>
                                        <div className="text-xs">
                                            <PercentageChange
                                                size="small"
                                                padding=""
                                                percentage={
                                                    tokenData?.market_data.price_change[timeFrame as keyof typeof tokenData.market_data.price_change]
                                                        .percentage ?? 0
                                                }
                                            ></PercentageChange>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* <div className="max-h-28 min-h-28 p-3 flex flex-col w-full">
              <div className=" border-border rounded-lg border w-full p-3 flex items-center justify-between gap-3 max-h-full overflow-hidden">
                <div className="flex flex-col">
                  <div className="text-xs text-neutral-text-dark">Ref Link</div>
                  <div className="">
                    {userReferralLink ?? 'trade.crush.xyz'}
                  </div>
                </div>
                <QRCodeSVG
                  bgColor="#000000"
                  fgColor="#dddddd"
                  marginSize={0}
                  value={userReferralLink ?? 'trade.crush.xyz'}
                  className="w-16"
                />
              </div>
            </div> */}
                    </div>
                </div>

                <div className="flex gap-3 justify-between">
                    <Button
                        type="button"
                        className="rounded-lg border text-xs border-border flex hover:bg-table-odd apply-transiiton flex-1  items-center justify-center"
                        onClick={() => {
                            handleCloseModal()
                        }}
                    >
                        Close
                    </Button>

                    <Button
                        type="button"
                        className="rounded-lg border border-border flex bg-table-odd text-xs hover:bg-neutral-900  apply-transiiton flex-1  items-center justify-center"
                        onClick={handleSaveImage}
                    >
                        {isCopying ? 'Copying...' : 'Save Image'}
                    </Button>
                    {/* <PrimaryButton className=" w-full flex-1" onClick={handleSaveImage}>
            {isCopying ? 'Copying...' : 'Save Image'}
          </PrimaryButton> */}
                </div>
            </div>
        </div>
    )
}

export default ShareTokenModal
