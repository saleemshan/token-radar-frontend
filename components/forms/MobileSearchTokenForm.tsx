'use client'
import React, { useEffect, useRef, useState } from 'react'
import Spinner from '../Spinner'
import Image from 'next/image'
import Link from 'next/link'
import useDebounce from '@/hooks/useDebounce'
import { useUser } from '@/context/UserContext'
import axios from 'axios'
import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image'
import { useRouter } from 'next/navigation'
import { getTokenUrl } from '@/utils/url'
import { FaChevronLeft, FaXmark } from 'react-icons/fa6'
import { deleteAllTokenSearchHistory, getTokenSearchHistory } from '@/utils/tokenSearch'
import SearchTokenItem from '../SearchTokenItem'

const MobileSearchTokenForm = () => {
    const searchResultDivRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const [searchQuery, setSearchquery] = useState('')
    const [searchResult, setSearchResult] = useState<Token[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const debouncedQuery = useDebounce(searchQuery, 1000)
    const { chain } = useUser()
    const router = useRouter()

    const [searchHistory, setSearchHistory] = useState<TokenSearchHistory[]>([])

    useEffect(() => {
        const localSearchHistory = getTokenSearchHistory()
        setSearchHistory(localSearchHistory ?? [])
    }, [])

    const handleReturnClick = () => {
        if (window.history.length > 1) {
            router.back()
        } else {
            router.replace('/')
        }
    }

    useEffect(() => {
        const handleSearchTokens = async () => {
            if (debouncedQuery.trim().length <= 0) return
            if (isSearching) return
            localStorage.setItem('lastSearchQuery', debouncedQuery)
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

    useEffect(() => {
        const lastSearchQuery = localStorage.getItem('lastSearchQuery')
        if (lastSearchQuery) {
            setSearchquery(lastSearchQuery)
        }

        if (searchInputRef?.current) {
            searchInputRef.current.focus()
        }
    }, [searchInputRef])

    return (
        <div className="fixed inset-0 bg-black overflow-hidden z-[100] flex flex-col ">
            <div className="flex items-center gap-2 p-3">
                <button
                    type="button"
                    onClick={() => {
                        handleReturnClick()
                        // setShowSearchPanel(!showSearchPanel);
                    }}
                    className={`flex  bg-table-odd border border-border rounded-lg px-2 gap-2 w-9 min-w-9 h-9  min-h-9 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text `}
                >
                    <FaChevronLeft className="block " />
                </button>

                <div className="relative w-full h-9 min-h-9 ">
                    <input
                        value={searchQuery}
                        onChange={e => setSearchquery(e.target.value)}
                        type="text"
                        className="w-full h-full rounded-lg px-3 focus:outline-none text-neutral-text bg-table-odd border  focus:border-border border-border text-sm "
                        placeholder="Search name/address/symbol"
                        ref={searchInputRef}
                    ></input>
                    {isSearching && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2" />}

                    {searchQuery && !isSearching && (
                        <button
                            onClick={() => {
                                setSearchquery('')
                                searchInputRef.current?.focus()
                            }}
                            type="button"
                            className="absolute top-1/2 -translate-y-1/2 right-2 rounded-lg w-6 h-6 flex items-center justify-center text-neutral-text  border-border  apply-transition"
                        >
                            <FaXmark className="text-xs" />
                        </button>
                    )}
                </div>

                {/* <button type="button" onClick={handleReturnClick}>
          Cancel
        </button> */}
            </div>
            {searchHistory && searchHistory.length > 0 && (
                <div className="flex gap-2 flex-wrap w-full p-3 relative">
                    <button
                        onClick={() => {
                            deleteAllTokenSearchHistory()
                            setSearchHistory([])
                        }}
                        type="button"
                        className="absolute right-2 top-2  bg-table-odd border border-border rounded-lg px-2 gap-2 w-6 min-w-6 h-6  min-h-6 flex items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text "
                    >
                        <FaXmark className="text-xs" />
                    </button>
                    {searchHistory.map(data => {
                        return (
                            <Link
                                href={getTokenUrl(data.chain, data.address, true)}
                                key={data.address}
                                passHref
                                className="flex items-center gap-1 hover:bg-neutral-800 apply-transition py-[2px] px-[2px] rounded-full"
                            >
                                <div className="min-w-6 min-h-6 max-w-6 max-h-6 rounded-full border border-border  relative flex items-center justify-center overflow-hidden">
                                    <Image
                                        src={data.logo ?? TOKEN_PLACEHOLDER_IMAGE}
                                        alt={`${data.name} logo`}
                                        width={200}
                                        height={200}
                                        className="rounded-full"
                                    />
                                </div>
                                <span className="text-xs pr-1">{data.symbol}</span>
                            </Link>
                        )
                    })}
                </div>
            )}
            {/* mb-[4.5rem] */}
            <div className="h-full overflow-hidden w-full ">
                <div className="flex flex-col h-full overflow-y-auto  w-full  pb-2" ref={searchResultDivRef}>
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
                                    isMobile={true}
                                />
                            )
                        })}
                </div>
            </div>
        </div>
    )
}

export default MobileSearchTokenForm
