'use client'
import { useUser } from '@/context/UserContext'
import { chains } from '@/data/default/chains'
import { getChainImage } from '@/utils/image'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const ChainButton = () => {
    const { chain, setChain } = useUser()
    const [showChainOptions, setShowChainOptions] = useState(false)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const pathnameArray = pathname.split('/')
        if (pathnameArray[2] === 'tokens') {
            if (pathnameArray[1] !== chain.id) {
                const targetChain = chains.find(chain => chain.id === pathnameArray[1])
                if (targetChain) {
                    setChain(targetChain)
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="relative">
            <button
                type="button"
                className={`flex  bg-table-odd border border-border rounded-lg px-2 gap-2 w-9 min-w-9 h-9  min-h-9 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text`}
                onClick={() => setShowChainOptions(!showChainOptions)}
            >
                <div className="min-w-4 min-h-4 max-w-4 max-h-4 relative flex items-center justify-center gap-2">
                    <Image src={getChainImage(chain.id)} alt={`${chain.name} logo`} width={200} height={200} className="" />
                </div>
            </button>

            {showChainOptions && (
                <div className="absolute top-11 z-[51]  flex flex-col border border-border bg-table-odd rounded-lg p-1  right-0">
                    {chains.map(newChain => {
                        return (
                            <button
                                key={newChain.id}
                                type="button"
                                className={`flex rounded-lg px-2 gap-2 h-9 min-h-9 items-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text
                }`}
                                onClick={() => {
                                    setChain(newChain)
                                    setShowChainOptions(false)
                                    if (newChain.id !== chain.id) {
                                        router.push(`/`)
                                    }
                                }}
                            >
                                <div className="min-w-4 min-h-4 max-w-4 max-h-4 relative flex items-center justify-center ">
                                    <Image src={getChainImage(newChain.id)} alt={`${newChain.name} logo`} width={200} height={200} className="" />
                                </div>
                                <span>{newChain.name}</span>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ChainButton
