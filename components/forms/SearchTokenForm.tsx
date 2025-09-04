'use client'

import useDebounce from '@/hooks/useDebounce'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import Spinner from '../Spinner'
import axios from 'axios'
import { useUser } from '@/context/UserContext'
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { getTokenUrl } from '@/utils/url'
import { deleteAllTokenSearchHistory, getTokenSearchHistory } from '@/utils/tokenSearch'
import { FaXmark } from 'react-icons/fa6'
import ClipboardMonitor from '@/components/global/ClipboardMonitor'
import SearchTokenItem from '../SearchTokenItem'

const SearchTokenForm = () => {
    const searchResultDivRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [searchQuery, setSearchquery] = useState('')
    const [showSearchResult, setShowSearchResult] = useState(false)
    const [searchResult, setSearchResult] = useState<Token[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const debouncedQuery = useDebounce(searchQuery, 1000)
    const { chain } = useUser()

    const [searchHistory, setSearchHistory] = useState<TokenSearchHistory[]>([])

    useEffect(() => {
        const localSearchHistory = getTokenSearchHistory()
        setSearchHistory(localSearchHistory ?? [])
    }, [showSearchResult])

    useEffect(() => {
        const handleSearchTokens = async () => {
            if (debouncedQuery.trim().length <= 0) return
            if (isSearching) return

            try {
                setIsSearching(true)
                const response = await axios.get(`/api/${chain.api}/tokens/search?query=${debouncedQuery}`)

                setSearchResult(response.data.data)
                setIsSearching(false)
                if (searchResultDivRef.current) searchResultDivRef.current.scrollTop = 0
            } catch (error) {
                console.error('Error fetching tokens:', error)
                setIsSearching(false)
            }
        }

        handleSearchTokens()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQuery])

    return (
        <div className="lg:relative w-full xl:w-[30rem] lg:ml-auto  flex justify-end items-center gap-2 ">
            <ClipboardMonitor />
            <div className="relative w-full  h-9 min-h-9 ">
                <input
                    onChange={e => setSearchquery(e.target.value)}
                    value={searchQuery}
                    type="text"
                    className="w-full h-full rounded-lg px-3 focus:outline-none text-neutral-text bg-table-odd border  focus:border-border border-border text-xs focus:bg-neutral-900"
                    placeholder="Search name/address/symbol"
                    onFocus={() => setShowSearchResult(true)}
                    onBlur={() => {
                        setShowSearchResult(false)
                    }}
                    ref={searchInputRef}
                />
                {isSearching && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2" />}

                {searchQuery && !isSearching && (
                    <button
                        onClick={() => {
                            setSearchquery('')
                            searchInputRef.current?.focus()
                        }}
                        type="button"
                        className="absolute top-1/2 -translate-y-1/2 right-2 rounded-md w-6 h-6 flex items-center justify-center text-neutral-text border border-border  apply-transition bg-table-odd hover:bg-neutral-900"
                    >
                        <FaXmark className="text-xs" />
                    </button>
                )}
            </div>
            {showSearchResult && (
                <div className="inset-x-0 p-3 lg:p-0 absolute top-12 z-[51] " onMouseDown={e => e.preventDefault()}>
                    <div className="rounded-lg bg-table-odd w-full border border-border flex flex-col overflow-hidden">
                        {/* <div className="text-white font-semibold p-3 border-b border-border">
              Token
            </div> */}

                        {searchHistory && searchHistory.length > 0 && (
                            <div className="flex gap-2 flex-wrap w-full p-3 relative">
                                <button
                                    onClick={() => {
                                        deleteAllTokenSearchHistory()
                                        setSearchHistory([])
                                    }}
                                    type="button"
                                    className="absolute right-2 top-2 rounded-md w-6 h-6 flex items-center justify-center text-neutral-text bg-table-odd border border-border hover:bg-neutral-900 apply-transition"
                                >
                                    <FaXmark className="text-xs" />
                                </button>
                                {searchHistory.map(data => {
                                    return (
                                        <Link
                                            onClick={() => {
                                                setShowSearchResult(false)
                                                if (searchInputRef) searchInputRef.current?.blur()
                                            }}
                                            href={getTokenUrl(data.chain, data.address)}
                                            key={data.address}
                                            passHref
                                            className="flex items-center gap-1 hover:bg-neutral-800 apply-transition py-[2px] px-[2px] rounded-full"
                                        >
                                            <div className="min-w-6 min-h-6 max-w-6 max-h-6 rounded-full border border-border  relative flex items-center justify-center overflow-hidden">
                                                <Image
                                                    src={data.logo ?? TOKEN_PLACEHOLDER_IMAGE}
                                                    alt={`${data.name} logo`}
                                                    width={100}
                                                    height={100}
                                                    className="rounded-full w-full h-full object-contain object-center"
                                                />
                                            </div>
                                            <span className="text-xs pr-1">{data.symbol}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                        <div className="flex flex-col h-72 overflow-y-auto  w-full divide-y divide-border/50 bg-table-even" ref={searchResultDivRef}>
                            {searchResult &&
                                searchResult.length > 0 &&
                                searchResult.map((token, index) => {
                                    return (
                                        <SearchTokenItem
                                            key={`${token.id}-${index}`}
                                            token={token}
                                            handleBlurSearchInput={() => {
                                                if (searchInputRef) searchInputRef.current?.blur()
                                            }}
                                            isMobile={false}
                                        />
                                    )
                                })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchTokenForm
