'use client'
import React from 'react'
import TradeForm from '../forms/TradeForm'

import FavouriteTokenButton from '../FavouriteTokenButton'
import TokenName from '../TokenName'
import Image from 'next/image'
import QueryTokenData from '../QueryTokenData'

const TradePanel = ({ tokenData, latestTokenPrice }: { tokenData: Token | undefined; latestTokenPrice?: number }) => {
    return (
        <>
            {/* desktop  */}
            <div className=" w-full  flex-col gap-2 max-h-fit min-h-fit h-fit md:flex hidden">
                <div className=" flex-1 flex flex-col border-b border-border h-full bg-black  overflow-hidden">
                    {tokenData?.image?.banner && (
                        <div className="w-full max-h-24 h-24 relative  border-b border-border">
                            <Image src={tokenData.image.banner} alt={tokenData.name} fill className="object-cover w-full h-full select-none" />
                        </div>
                    )}
                    <div className="flex flex-col  w-full ">
                        <div className="w-full flex flex-col p-3 gap-3">
                            <div className="flex items-center gap-2">
                                <FavouriteTokenButton tokenData={tokenData} />
                                <TokenName token={tokenData} size="normal" />
                            </div>

                            <QueryTokenData tokenData={tokenData} />
                        </div>

                        <TradeForm tokenData={tokenData} latestTokenPrice={latestTokenPrice} />
                    </div>
                    {/* {ready && authenticated && tokenData ? (
            <TradeForm tokenData={tokenData as Token} />
          ) : (
            <div className="flex justify-center items-center flex-col gap-3 border p-3 rounded-lg border-border py-6">
              <div className="flex h-full gap-1 justify-center items-center text-center bg-black/50 backdrop-blur-sm ">
                <button
                  type="button"
                  onClick={handleSignIn}
                  className=" underline "
                >
                  Sign in
                </button>
                <span>{`to use start trading`}</span>
              </div>
            </div>
          )} */}
                </div>
            </div>
        </>
    )
}

export default TradePanel
