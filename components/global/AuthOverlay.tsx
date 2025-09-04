'use client'

import React from 'react'
import PrimaryButton from '../PrimaryButton'
import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth'
import Image from 'next/image'
import useIsStandAloneApp from '@/hooks/useIsStandaloneApp'

const AuthOverlay = () => {
    const { logout: handleSignOut } = useLogout()
    const { ready, authenticated } = usePrivy()
    const isStandAloneApp = useIsStandAloneApp()

    const { login: handleSignIn } = useLogin()

    if (ready && !authenticated && isStandAloneApp) {
        return (
            <div className={`fixed inset-0 z-[1000] flex md:hidden bg-black flex-col p-3 items-center justify-center gap-3`}>
                <Image src={`${process.env.basePath}/images/brand/logo-wordmark.png`} alt="Crush Logo" width={150} height={150} className="" />

                <div>Sign in to continue using Crush</div>
                <PrimaryButton
                    className=""
                    onClick={() => {
                        authenticated ? handleSignOut() : handleSignIn()
                    }}
                >
                    Sign In
                </PrimaryButton>
            </div>
        )
    }
}

export default AuthOverlay
