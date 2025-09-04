'use client'
import { useUser } from '@/context/UserContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
import { FaNewspaper } from 'react-icons/fa6'
import { HiHome, HiWallet } from 'react-icons/hi2'

const MobileBottomNavbar = () => {
    const pathname = usePathname()
    const { setShowAlphaFeed, setShowAIAssistant } = useUser()

    const navigations = [
        {
            name: 'Home',
            href: '/mobile/quick-access',
            icon: <HiHome className="text-lg" />,
            match: true,
        },
        {
            name: 'News',
            href: '/',
            icon: <FaNewspaper className="text-base " />,
            match: false,
        },
        // {
        //   name: 'Trade',
        //   href: getTokenUrl(
        //     lastSelectedToken?.chain ?? 'solana',
        //     lastSelectedToken?.address ??
        //       'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',
        //     true,
        //   ),
        //   icon: <HiStopCircle className="text-lg rotate-45" />,
        //   match: false,
        // },
        {
            name: 'Wallet',
            href: '/mobile/wallet',
            icon: <HiWallet className="text-lg" />,
            match: false,
        },
    ]

    return (
        <div className="fixed bottom-0 inset-x-0 p-3 pb-7 flex justify-around z-[100] bg-black border-t border-border/100 md:hidden text-neutral-text-dark">
            {navigations.map(navigation => {
                return (
                    <Link
                        key={navigation.name}
                        href={navigation.href}
                        onClick={() => {
                            setShowAIAssistant(false)
                            setShowAlphaFeed(false)
                        }}
                        className={`flex flex-col gap-1 items-center select-none   ${
                            pathname === navigation.href ? 'text-neutral-text' : 'hover:text-neutral-text apply-transition`'
                        } `}
                    >
                        {navigation.icon}
                        <div className="text-xs -mt-1 w-12 text-center">{navigation.name}</div>
                    </Link>
                )
            })}
        </div>
    )
}

export default MobileBottomNavbar
