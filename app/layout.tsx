import './globals.css'
import 'react-toastify/dist/ReactToastify.css'
import '../public/css/toast.css'
import '../public/css/tradingview.css'

import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Montserrat, Open_Sans } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ToastContainer } from 'react-toastify'
import Navbar from '@/components/global/Navbar'
import AuthOverlay from '@/components/global/AuthOverlay'
import DisableInstallPrompt from '@/components/global/DisableInstallPrompt'
import AIAssistantOverlay from '@/components/global/AIAssistantOverlay'
import ReferralGate from '@/components/global/ReferralGate'
import StatusBar from '@/components/global/StatusBar'
import WarningBanner from '@/components/global/WarningBanner'
import MobileAddToHomeScreenPrompt from '@/components/mobile/MobileAddToHomeScreenPrompt'
import ContextProviders from '@/context'

const montserrat = Montserrat({
    subsets: ['latin'],
    weight: ['400', '600', '700'], // normal, semi-bold, bold
    variable: '--font-montserrat',
})

const openSans = Open_Sans({
    subsets: ['latin'],
    weight: ['400', '600', '700'], // normal, semi-bold, bold
    variable: '--font-open-sans',
})

export const metadata: Metadata = {
    title: 'Crush AI - News Trading Platform powered by AI Agents',
    description:
        'Crush lets you long or short perps and onchain tokens instantly on breaking news — filtered by AI, traded in one click. Set automated strategies to snipe headlines before the market reacts.',
    icons: {
        icon: '/favicons/favicon.ico',
    },
    openGraph: {
        images: ['https://res.cloudinary.com/crush-xyz/image/upload/v1722303692/meta-image_uzs8qu.jpg'],
        creators: ['@CrushProtocol'],
    },
    other: {
        preconnect: [
            'https://res.cloudinary.com',
            'https://explorer-api.walletconnect.com',
            'https://oauth.telegram.org',
            'https://app.hyperliquid.xyz',
            'https://auth.privy.io',
        ],
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className="">
            <head>
                <meta name="mobile-web-app-capable" content="yes"></meta>
                <meta name="apple-mobile-web-app-capable" content="yes"></meta>
                <meta name="apple-mobile-web-app-title" content="Crush"></meta>
                <meta name="apple-mobile-web-app-status-bar-style" content="black"></meta>
                <meta name="viewport" content="width=device-width" />
                <meta name="viewport" content="initial-scale=1.0" />
                <meta name="viewport" content=" maximum-scale=1.0" />
                <meta name="viewport" content=" user-scalable=no" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
                <meta name="HandheldFriendly" content="true" />
            </head>
            <meta name="theme-color" content="#000000"></meta>
            <body
                className={`${openSans.variable} ${montserrat.variable}  antialiased  text-sm bg-black md:bg-black text-neutral-text overflow-hidden max-h-screen w-full relative`}
            >
                <DisableInstallPrompt />

                <ContextProviders>
                    <Suspense>
                        <AuthOverlay />
                    </Suspense>

                    <div className="min-h-screen max-h-screen w-full flex flex-col overflow-hidden font-open-sans font-semibold select-none">
                        {/* Warning banner that shows when NEXT_PUBLIC_SHOW_WARNING is set */}
                        <WarningBanner />
                        <Suspense>
                            <Navbar />
                        </Suspense>

                        <div className={`flex-1  md:p-0 flex  overflow-hidden justify-between  md:mt-0 `} id="main-wrapper">
                            {children}
                        </div>

                        <StatusBar />
                    </div>

                    <div className="font-open-sans relative z-[100]" id="modal-portal"></div>
                    <MobileAddToHomeScreenPrompt />

                    <ToastContainer position="top-center" autoClose={8000} newestOnTop={false} limit={5} closeButton={true} />
                    <AIAssistantOverlay />
                    <ReferralGate />
                </ContextProviders>
            </body>
            <GoogleAnalytics gaId="G-94TCHX7KM0" />
        </html>
    )
}
