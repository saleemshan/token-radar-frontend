import React, { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
// import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { getTokenSymbolAbbreviation } from '@/utils/string'
import { countDecimalPlaces, getReadableNumber } from '@/utils/price'
import Button from '../ui/Button'
import useHaptic from '@/hooks/useHaptic'

const SharePositionModal = ({ holding, handleCloseModal }: { holding?: UserTokenHolding | undefined; handleCloseModal: () => void }) => {
    // const { userReferralLink } = useUser();
    const { triggerHaptic } = useHaptic()
    const [isCopying, setIsCopying] = useState(false)
    const captureRef = useRef<HTMLDivElement | null>(null)

    // useEffect(() => {
    //   console.log({ holding });
    // }, [holding]);

    const handleSaveImage = async () => {
        if (captureRef.current) {
            triggerHaptic(50)
            setIsCopying(true)
            try {
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

    if (holding)
        return (
            <div
                onClick={e => {
                    if (e.currentTarget === e.target) {
                        handleCloseModal()
                    }
                }}
                className="fixed z-[53] inset-0 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur p-4"
            >
                <div className=" max-w-sm min-w-sm   flex flex-col gap-3 border border-border bg-black p-3 rounded-xl w-full">
                    <div className=" border-border border rounded-lg overflow-hidden flex flex-col">
                        <div ref={captureRef} className="flex flex-col  h-full flex-1  max-h-[80vh] overflow-y-auto bg-black w-full min-h-fit">
                            <div className="w-full flex flex-col relative ">
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
                                    {/* <div className="relative">
                                        <div
                                            className="bg-contain bg-center bg-no-repeat size-10 border border-border rounded-full flex items-center justify-center overflow-hidden"
                                            style={{
                                                backgroundImage: `url('${holding?.token?.logo ?? TOKEN_PLACEHOLDER_IMAGE}')`,
                                            }}
                                        ></div>
                                    </div> */}

                                    <div className="flex flex-col gap-1">
                                        <div className=" text-2xs font-semibold  text-neutral-text-dark leading-none">{holding?.token.name}</div>
                                        <div className=" text-sm font-semibold  text-neutral-text leading-none flex items-center gap-1">
                                            <span>{holding?.token.symbol}</span>
                                            <span>/</span>
                                            <span>{getTokenSymbolAbbreviation(holding?.chain)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-end px-3 pb-3 gap-2 relative">
                                    <div
                                        className={`text-3xl font-bold leading-none ${
                                            holding.total_profit_pnl > 0
                                                ? 'text-positive'
                                                : holding.total_profit_pnl < 0
                                                ? 'text-negative'
                                                : 'text-neutral-text'
                                        }`}
                                    >
                                        {getReadableNumber(holding.total_profit_pnl * 100, 2)}%
                                    </div>
                                    <div
                                        className={`leading-none font-semibold ${
                                            holding.total_profit < 0
                                                ? 'text-negative'
                                                : holding.total_profit > 0
                                                ? 'text-positive'
                                                : 'text-neutral-text'
                                        }`}
                                    >
                                        {getReadableNumber(
                                            Math.abs(holding.total_profit),
                                            countDecimalPlaces(Math.abs(holding.total_profit), 2, 2),
                                            '$'
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full flex flex-col  px-3 py-3">
                                <div className="flex justify-between gap-3">
                                    <div className=" text-neutral-text-dark text-xs ">Holdings</div>
                                    <div className=" text-xs  text-neutral-text">
                                        {getReadableNumber(holding.balance, countDecimalPlaces(holding.balance, 2, 2))}
                                        {` ${holding.token.symbol}`}
                                        {` (${getReadableNumber(holding.usd_value, countDecimalPlaces(holding.usd_value, 2, 2), '$')})`}
                                    </div>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <div className=" text-neutral-text-dark text-xs ">Bought MCAP</div>
                                    <div className=" text-xs  text-neutral-text">{getReadableNumber(holding.avg_bought_mcap ?? 0, 2, '$')}</div>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <div className=" text-neutral-text-dark text-xs ">Current MCAP</div>
                                    <div className=" text-xs  text-neutral-text">
                                        {getReadableNumber(holding.token.current_market_cap ?? 0, 2, '$')}
                                    </div>
                                </div>
                            </div>

                            {/* <div className="max-h-28 min-h-28 px-3 border-t border-border flex flex-col w-full mt-auto">
                <div className=" border-border rounded-lg  w-full flex items-center justify-between gap-3 max-h-full overflow-hidden">
                  <div className="flex flex-col">
                    <div className="text-xs text-neutral-text-dark">
                      Referral Link
                    </div>
                    <div className="text-xs">
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
                            variant="ghost"
                            height="min-h-10"
                            className="rounded-lg border border-border flex text-xs  apply-transiiton flex-1  items-center justify-center"
                            onClick={() => {
                                handleCloseModal()
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            type="button"
                            className="rounded-lg border border-border flex text-xs  apply-transiiton flex-1  items-center justify-center"
                            onClick={handleSaveImage}
                            height="min-h-10"
                            variant="primary"
                        >
                            {isCopying ? 'Copying...' : 'Save'}
                        </Button>
                        {/* <PrimaryButton className=" w-full flex-1" onClick={handleSaveImage}>
              {isCopying ? 'Copying...' : 'Save Image'}
            </PrimaryButton> */}
                    </div>
                </div>
            </div>
        )
}

export default SharePositionModal
