'use client'
import Image from 'next/image'
import React from 'react'
import { FaRobot } from 'react-icons/fa6'

import { useUser } from '@/context/UserContext'
import Link from 'next/link'
import { useLogin, usePrivy } from '@privy-io/react-auth'

const MobileTopNavbar = () => {
    const {
        // chain,
        showAIAssistant,
        toggleAIAssistant,
        // showAlphaFeed,
        // toggleAlphaFeed,
        // toggleFavouritesPanel,
        // showFavouritesPanel,
    } = useUser()

    const { ready, authenticated } = usePrivy()
    const { login: handleSignIn } = useLogin()

    return (
        <div className="flex md:hidden items-center gap-2 p-3  min-h-16 max-h-16 bg-black border-b-2 border-border">
            {ready && authenticated ? (
                <>
                    <Link
                        href={`/mobile/quick-access`}
                        className=" w-9 h-9 min-w-9 min-h-9 p-[6px] bg-table-odd border border-border overflow-hidden rounded-lg flex items-center justify-center"
                    >
                        <Image src={`${process.env.basePath}/images/brand/logo.svg`} alt="Crush Logo" width={50} height={50} className="" />
                    </Link>
                </>
            ) : (
                <>
                    <button
                        type="button"
                        onClick={handleSignIn}
                        className=" w-9 h-9 min-w-9 min-h-9 p-[6px] bg-table-odd border border-border overflow-hidden rounded-lg flex items-center justify-center"
                    >
                        <Image src={`${process.env.basePath}/images/brand/logo.svg`} alt="Crush Logo" width={50} height={50} className="" />
                    </button>
                </>
            )}

            <div className="lg:relative w-full lg:w-fit lg:ml-auto  flex justify-end ">
                {/* <div className="relative w-full lg:w-80 h-9 min-h-9 ">
                    <Link
                        href={`/mobile/search`}
                        className="absolute inset-0 w-full h-full flex items-center rounded-lg px-3 focus:outline-none text-neutral-text-dark bg-table-odd border  focus:border-border border-border text-sm "
                    >
                        Search
                    </Link>
                </div> */}
            </div>

            {/* {process.env.NEXT_PUBLIC_ENABLE_ATS === 'true' && (
        <>
          {ready && authenticated ? (
            <Link
              href={`/ats`}
              className={`flex  bg-table-odd border-border border rounded-lg w-9 h-9 min-w-9 min-h-9 items-center justify-center  hover:bg-neutral-900  apply-transition text-neutral-text-dark p-[6px]`}
            >
              <FaChessKnight className="text-base" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className={`flex  bg-table-odd border-border border rounded-lg w-9 h-9 min-w-9 min-h-9 items-center justify-center  hover:bg-neutral-900  apply-transition text-neutral-text-dark p-[6px]`}
            >
              <FaChessKnight className="text-base" />
            </button>
          )}
        </>
      )} */}

            {process.env.NEXT_PUBLIC_ENABLE_AI_COMPANION === 'true' && (
                <button
                    type="button"
                    onClick={toggleAIAssistant}
                    className={`flex bg-table-odd border-border border rounded-lg w-9 h-9 min-w-9 min-h-9 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text p-[6px] ${
                        showAIAssistant ? 'text-neutral-text' : 'text-neutral-text-dark '
                    }`}
                >
                    <FaRobot className="text-base" />
                </button>
            )}

            {/* <button
        type="button"
        onClick={toggleAlphaFeed}
        className={`flex  bg-table-odd border-border border rounded-lg w-9 h-9 min-w-9 min-h-9 items-center justify-center  hover:bg-neutral-900  apply-transition hover:text-neutral-text p-[6px] ${
          showAlphaFeed ? 'text-neutral-text' : 'text-neutral-text-dark '
        }`}
      >
        <MdOutlineRadar className="text-base" />
      </button>
      <button
        type="button"
        onClick={toggleFavouritesPanel}
        className={`flex  bg-table-odd border-border border rounded-lg w-9 h-9 min-w-9 min-h-9 items-center justify-center  hover:bg-neutral-900  apply-transition hover:text-neutral-text p-[6px] ${
          showFavouritesPanel ? 'text-neutral-text' : 'text-neutral-text-dark '
        }`}
      >
        <FaStar className="text-base" />
      </button> */}
        </div>
    )
}

export default MobileTopNavbar
