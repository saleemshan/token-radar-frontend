import React, { useRef, useState } from 'react'
import html2canvas from 'html2canvas'

import Button from '../ui/Button'
import Portal from '@/portal/ModalPortal'
import useHaptic from '@/hooks/useHaptic'

// import { TokenImage } from '../Hyperliquid/SelectTokenPairTable'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ShareNewsTradingPositionModal = ({ position, handleCloseModal }: { position?: any; handleCloseModal: () => void }) => {
    const [isCopying, setIsCopying] = useState(false)
    const captureRef = useRef<HTMLDivElement | null>(null)
    const { triggerHaptic } = useHaptic()
    // const [svgBase64, setSvgBase64] = useState<string | null>(null)

    // const getBase64FromUrl = async (url: string): Promise<string> => {
    //     const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`)
    //     const blob = await res.blob()
    //     return new Promise(resolve => {
    //         const reader = new FileReader()
    //         reader.onloadend = () => resolve(reader.result as string)
    //         reader.readAsDataURL(blob)
    //     })
    // }

    // useEffect(() => {
    //     if (position && position.coin) {
    //         getBase64FromUrl(`https://app.hyperliquid.xyz/coins/${position.coin}.svg`).then(setSvgBase64)
    //         //    console.log({ position })
    //     }
    // }, [position])

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
            } catch (error) {
                setIsCopying(false)
                console.error('Could not generate image', error)
            }
        } else {
            console.error('Element not found')
        }
    }

    if (position)
        return (
            <Portal targetId="modal-portal">
                <div
                    onClick={e => {
                        if (e.currentTarget === e.target) {
                            handleCloseModal()
                        }
                    }}
                    className="fixed z-[200] inset-0 flex items-center justify-center bg-black bg-opacity-25 backdrop-blur p-4"
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
                                            className="bg-contain bg-center min-w-[4.5rem] max-w-[4.5rem] min-h-8 max-h-8 bg-no-repeat"
                                            style={{
                                                backgroundImage: "url('/images/brand/logo-wordmark.svg')",
                                            }}
                                        ></div>

                                        <div className="text-2xs italic">crush.xyz</div>
                                    </div>
                                    <div className=" px-3 py-3 flex items-center gap-3 relative">
                                        {/* <div className="relative">
                                             <div className=" size-10 relative border border-border rounded-full flex items-center justify-center overflow-hidden">
                                                <div
                                                    className="absolute inset-0 bg-center bg-cover"
                                                    style={{
                                                        backgroundImage: `url('/api/image-proxy?url=https://app.hyperliquid.xyz/coins/${position?.coin}.svg')`,
                                                        backgroundSize: '150%',
                                                    }}
                                                ></div>
                                            </div>  {svgBase64 && (
                                                <TokenImage
                                                    imageUrl={svgBase64}
                                                    symbol={position?.coin ?? ''}
                                                    className="min-w-10 min-h-10 max-w-10 max-h-10 rounded-full"
                                                />
                                            )} 
                                        </div> */}

                                        <div className="flex gap-2 items-end">
                                            <div className=" text-lg font-semibold  text-neutral-text leading-none flex items-center gap-1">
                                                <span>{position?.coin}</span>
                                            </div>
                                            <div className="flex items-center divide-x divide-border mb-[2px]">
                                                <div
                                                    className={`text-2xs font-semibold  text-neutral-text leading-none pr-1 ${
                                                        position?.positionDirection === 'Long' ? 'text-positive' : 'text-negative'
                                                    }`}
                                                >
                                                    {position?.positionDirection}
                                                </div>
                                                <div className=" text-2xs font-semibold  text-neutral-text leading-none px-1">
                                                    {position?.leverage}X
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-end px-3 pb-3 gap-2 relative">
                                        <div
                                            className={`text-3xl font-bold leading-none ${
                                                position.pnlDirection.toLowerCase() === 'positive'
                                                    ? 'text-positive'
                                                    : position.pnlDirection.toLowerCase() === 'negative'
                                                    ? 'text-negative'
                                                    : 'text-neutral-text'
                                            }`}
                                        >
                                            {position.roe}
                                        </div>
                                        {/* <div
                                            className={`leading-none font-semibold ${
                                                position.pnlDirection.toLowerCase() === 'positive'
                                                    ? 'text-positive'
                                                    : position.pnlDirection.toLowerCase() === 'negative'
                                                    ? 'text-negative'
                                                    : 'text-neutral-text'
                                            }`}
                                        >
                                            {getReadableNumber(Math.abs(position.roe), countDecimalPlaces(Math.abs(position.roe), 2, 2), '$')}
                                        </div> */}
                                    </div>
                                </div>

                                <div className="w-full flex flex-col  px-3 py-3">
                                    <div className="flex justify-between gap-3">
                                        <div className=" text-neutral-text-dark text-xs ">Entry Price</div>
                                        <div className=" text-xs  text-neutral-text">{position?.entryPrice}</div>
                                    </div>
                                    <div className="flex justify-between gap-3">
                                        <div className=" text-neutral-text-dark text-xs ">Mark Price</div>
                                        <div className=" text-xs  text-neutral-text">{position?.markPrice}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-between">
                            <Button
                                variant="ghost"
                                className="rounded-lg border border-border flex text-xs hover:bg-table-odd  apply-transiiton flex-1  items-center justify-center"
                                onClick={() => {
                                    handleCloseModal()
                                }}
                            >
                                Close
                            </Button>
                            <Button
                                type="button"
                                className="rounded-lg border text-xs border-border flex bg-table-odd hover:bg-neutral-900 apply-transiiton flex-1  items-center justify-center"
                                onClick={handleSaveImage}
                            >
                                {isCopying ? 'Copying...' : 'Save Image'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Portal>
        )
}

export default ShareNewsTradingPositionModal
