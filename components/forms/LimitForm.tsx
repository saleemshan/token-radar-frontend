import React, { useEffect, useState } from 'react'
import DecimalInput from '../input/DecimalInput'
import { FaWallet } from 'react-icons/fa6'
import { LuArrowLeftRight } from 'react-icons/lu'
import Tooltip from '../Tooltip'
import Button from '../ui/Button'

const LimitForm = ({
    tokenData,
    latestTokenPrice,
    chainTokenPrice,
    userTokenBalanceData,
    userSolBalanceData,
    chain,
}: {
    tokenData: Token | undefined
    latestTokenPrice?: number
    chainTokenPrice?: TokenPrice
    userTokenBalanceData?: number
    userSolBalanceData?: number
    chain?: Chain
}) => {
    const pricePreset = ['Market', '0.05', '0.1']

    const [isPayTargetToken, setIsPayTargetToken] = useState(true)

    const [targetPrice, setTargetPrice] = useState<undefined | string>('0')
    const [receiveInput, setReceiveInput] = useState<undefined | string>(undefined)
    const [payInput, setPayInput] = useState<undefined | string>(undefined)

    const handleTargetPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = +e.target.value
        setTargetPrice(value.toString())

        if (!payInput) return
        if (!chainTokenPrice) return

        if (isPayTargetToken) {
            const tokenUsdValue = value * +payInput
            const receiveInput = tokenUsdValue / chainTokenPrice.priceUSD
            setReceiveInput(receiveInput.toString())
        } else {
            //sol up
            const solUsdValue = +payInput * chainTokenPrice.priceUSD
            const receiveInput = solUsdValue / +value
            setReceiveInput(receiveInput.toString())
        }
    }

    const handlePayInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!chainTokenPrice) return

        const value = +e.target.value
        setPayInput(value.toString())

        if (isPayTargetToken) {
            const tokenUsdValue = value * (targetPrice ? +targetPrice : 0)
            const receiveInput = tokenUsdValue / chainTokenPrice.priceUSD
            setReceiveInput(receiveInput.toString())
        } else {
            const solUsdValue = value * chainTokenPrice.priceUSD
            const receiveInput = solUsdValue / (targetPrice ? +targetPrice : 0)
            setReceiveInput(receiveInput.toString())
        }
    }

    const handleReceiveInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!chainTokenPrice) return

        const value = +e.target.value
        setReceiveInput(value.toString())

        if (isPayTargetToken) {
            const solUsdValue = value * chainTokenPrice.priceUSD
            const payInput = solUsdValue / (targetPrice ? +targetPrice : 0)
            setPayInput(payInput.toString())
        } else {
            const tokenUsdValue = value * (targetPrice ? +targetPrice : 0)
            const payInput = tokenUsdValue / chainTokenPrice.priceUSD
            setPayInput(payInput.toString())
        }
    }

    useEffect(() => {
        if (tokenData) {
            setTargetPrice(tokenData?.market_data.current_price.usd?.toFixed(4))
        }
    }, [tokenData])

    useEffect(() => {
        //
        if (!chainTokenPrice) return
        if (payInput) {
            //set receive input
            if (!isPayTargetToken) {
                const solUsdValue = +payInput * chainTokenPrice.priceUSD

                const newReceiveInput = solUsdValue / (targetPrice ? +targetPrice : 0)
                setReceiveInput(newReceiveInput.toString())
            } else {
                const tokenUsdValue = +payInput * (targetPrice ? +targetPrice : 0)
                const newReceiveInput = tokenUsdValue / chainTokenPrice.priceUSD
                setReceiveInput(newReceiveInput.toString())
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetPrice])

    return (
        <div className="flex flex-col w-full gap-3 p-3">
            <div className="flex flex-col w-full border border-border rounded-lg gap-2 py-2 bg-[#0f0f0f]">
                <div className="flex items-center px-2  flex-wrap gap-1">
                    <div className="text-xs">When ${tokenData?.symbol} is worth</div>
                </div>
                <div className="flex items-center justify-between mx-2 h-8 relative">
                    <div className="text-base absolute left-0 inset-y-0   flex items-center  justify-center leading-none pointer-events-none">$</div>
                    <DecimalInput className=" text-left h-full w-full pl-4 bg-transparent" value={targetPrice} onChange={handleTargetPriceChange} />
                </div>
                <div className="flex gap-2 flex-wrap px-2 ">
                    {pricePreset.map((price, index) => {
                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    if (price.toLowerCase() === 'market') {
                                        if (latestTokenPrice) {
                                            setTargetPrice(latestTokenPrice.toFixed(3))
                                            return
                                        }

                                        if (tokenData) {
                                            setTargetPrice(tokenData.market_data.current_price.usd.toFixed(3))
                                            return
                                        }
                                    } else {
                                        if (tokenData) {
                                            const tokenPrice = JSON.parse(JSON.stringify(tokenData.market_data.current_price.usd))
                                            setTargetPrice((tokenPrice + tokenPrice * +price).toFixed(3))
                                            return
                                        }
                                    }
                                }}
                                type="button"
                                className="px-1 py-[2px] text-2xs text-neutral-text-dark rounded-xl leading-none bg-neutral-900 hover:text-neutral-text hover:bg-neutral-800 duration-200 transition-all"
                            >
                                {price !== 'Market' ? `${+price * 100}%` : 'Market'}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex flex-col relative gap-2">
                <button
                    type="button"
                    onClick={() => {
                        const tempReceiveInput = JSON.parse(JSON.stringify(receiveInput))
                        const tempPayInput = JSON.parse(JSON.stringify(payInput))
                        setPayInput(tempReceiveInput)
                        setReceiveInput(tempPayInput)
                        setIsPayTargetToken(!isPayTargetToken)
                    }}
                    className="absolute translate-x-1/2 right-1/2 translate-y-1/2 bottom-1/2 w-6 h-6 bg-table-odd border-border border flex items-center justify-center rounded-md text-neutral-text-dark hover:text-neutral-text hover:bg-neutral-900  apply-transition"
                >
                    <LuArrowLeftRight className="rotate-90" />
                </button>
                <div className="flex flex-col w-full border border-border rounded-lg gap-2 py-2 bg-[#0f0f0f]">
                    <div className="flex items-center justify-between gap-3 px-2 ">
                        <div className="text-xs text-neutral-text-dark">You Pay</div>
                        <Tooltip text="Your wallet balance">
                            <div className="flex items-center gap-1 text-neutral-text-dark">
                                <FaWallet className="text-2xs" />
                                <div className="text-xs ">{isPayTargetToken ? userTokenBalanceData?.toFixed(3) : userSolBalanceData?.toFixed(3)}</div>
                            </div>
                        </Tooltip>
                    </div>
                    <div className="flex items-center justify-between mx-2 h-8 relative gap-2">
                        <DecimalInput onChange={handlePayInputChange} value={payInput} className=" text-left h-full w-full bg-transparent" />
                        <div className="text-xs">{isPayTargetToken ? tokenData?.symbol : chain?.symbol}</div>
                    </div>

                    <div className="flex items-center justify-between gap-3 px-2 text-2xs ">
                        <div className="flex text-xs text-neutral-text-dark">{isPayTargetToken ? tokenData?.name : chain?.name}</div>
                        {tokenData && chainTokenPrice && payInput && targetPrice && (
                            <div className="flex text-xs text-neutral-text-dark">
                                ~$
                                {isPayTargetToken ? (+payInput * +targetPrice).toFixed(2) : (+payInput * chainTokenPrice.priceUSD).toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col w-full border border-border rounded-lg gap-2 py-2 bg-[#0f0f0f]">
                    <div className="flex items-center justify-between gap-3 px-2 ">
                        <div className="text-xs text-neutral-text-dark">You Receive</div>
                        <Tooltip text="Your wallet balance">
                            <div className="flex items-center gap-1 text-neutral-text-dark ">
                                <FaWallet className="text-2xs" />
                                <div className="text-xs ">{isPayTargetToken ? userSolBalanceData?.toFixed(3) : userTokenBalanceData?.toFixed(3)}</div>
                            </div>
                        </Tooltip>
                    </div>
                    <div className="flex items-center justify-between mx-2 h-8 relative gap-2">
                        <DecimalInput onChange={handleReceiveInputChange} value={receiveInput} className=" text-left h-full w-full bg-transparent" />
                        <div className="text-xs">{isPayTargetToken ? chain?.symbol : tokenData?.symbol}</div>
                    </div>

                    <div className="flex items-center justify-between gap-3 px-2 text-2xs">
                        <div className="flex  text-xs text-neutral-text-dark">{isPayTargetToken ? chain?.name : tokenData?.name}</div>
                        {tokenData && chainTokenPrice && receiveInput && targetPrice && (
                            <div className="flex text-xs text-neutral-text-dark">
                                ~$
                                {!isPayTargetToken
                                    ? (+receiveInput * +targetPrice).toFixed(2)
                                    : (+receiveInput * chainTokenPrice.priceUSD).toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col w-full border border-border rounded-lg gap-2 py-2 bg-[#0f0f0f]">
                <div className="flex items-center px-2  flex-wrap gap-1">
                    <div className="text-xs text-neutral-text-dark">Expiry</div>
                </div>
                <div className="flex items-center justify-between mx-2 h-8 relative">
                    <div className=" absolute right-0 inset-y-0  w-8 flex items-center  justify-center leading-none pointer-events-none">Days</div>
                    <DecimalInput className=" text-left h-full w-full pr-8 bg-transparent" value={'1'} />
                </div>
                {/* <div className="flex gap-2 flex-wrap px-2 ">

        </div> */}
            </div>
            <Button
                type="button"
                className={`flex items-center justify-center gap-2 px-3 min-h-12 rounded-lg font-semibold text-xs   duration-200 transition-all  flex-1 bg-neutral-900`}
            >
                Submit
            </Button>
        </div>
    )
}

export default LimitForm
