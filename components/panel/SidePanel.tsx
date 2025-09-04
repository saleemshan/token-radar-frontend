'use client'
import React, { useEffect, useState } from 'react'
import TrendingPanel from './TrendingPanel'
import FavouritesPanel from './FavouritesPanel'
import AlphaFeedPanel from './AlphaFeedPanel'
import { usePathname } from 'next/navigation'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { MdDragIndicator } from 'react-icons/md'

type Tab = 'Trending' | 'Watchlist' | 'Alpha Feed'

const SidePanel = () => {
    const pathname = usePathname()
    const homeTabs: Tab[] = ['Watchlist', 'Alpha Feed']
    const tokenTabs: Tab[] = ['Trending', 'Watchlist', 'Alpha Feed']

    const [tabs] = useState<Tab[]>(pathname === '/memecoins' || pathname === '/memecoins/new-pairs' ? [...homeTabs] : [...tokenTabs])

    const localStorageKey = pathname === '/memecoins' || pathname === '/memecoins/new-pairs' ? 'leftideBarTabsHome' : 'leftSideBarTabsToken'

    const [activeTabs, setActiveTabs] = useState<Tab[]>([])

    useEffect(() => {
        const storedTabs = localStorage.getItem(localStorageKey)
        if (storedTabs) {
            const parsedTabs = JSON.parse(storedTabs)
            setActiveTabs(parsedTabs)
        } else {
            if (pathname === '/memecoins' || pathname === '/memecoins/new-pairs') {
                setActiveTabs([...homeTabs])
            } else {
                setActiveTabs([...tokenTabs])
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [localStorageKey])

    useEffect(() => {
        if (activeTabs.length > 0) {
            localStorage.setItem(localStorageKey, JSON.stringify(activeTabs))
        }
    }, [activeTabs, localStorageKey])

    const toggleTab = (tab: Tab) => {
        // Disable toggling if there's only one active tab
        if (activeTabs.length === 1 && activeTabs.includes(tab)) {
            return
        }

        setActiveTabs(prevActiveTabs => {
            if (prevActiveTabs.includes(tab)) {
                return prevActiveTabs.filter(activeTab => activeTab !== tab)
            } else {
                return [...prevActiveTabs, tab]
            }
        })
    }

    return (
        <div className="   hidden md:flex flex-col gap-3 overflow-hidden w-full pointer-events-none">
            <div className=" w-full min-h-full max-h-full flex flex-col  pointer-events-auto  border-border border-r  bg-black">
                <div className="flex items-center justify-between min-h-16  max-h-16 p-2 border-b border-border  w-full">
                    {/* <div>Side Panel</div> */}
                    <div className="flex overflow-x-auto no-scrollbar p-1 gap-1 w-full  h-full border border-border rounded-lg  justify-end ">
                        {tabs.map(tab => {
                            return (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        toggleTab(tab)
                                    }}
                                    className={` flex w-full text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-900 duration-200 rounded-md transition-all  px-4  font-semibold ${
                                        activeTabs.includes(tab) ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
                                    }`}
                                >
                                    {tab}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <PanelGroup
                    autoSaveId="sidePanel"
                    direction="vertical"
                    className="flex-1 max-h-full  overflow-hidden flex flex-col divide-y divide-border"
                >
                    {activeTabs.includes('Trending') && tabs.includes('Trending') && (
                        <>
                            <Panel id="top" order={1} minSize={20}>
                                <TrendingPanel
                                    showFavouriteButton={true}
                                    size="extra-small"
                                    rounded={false}
                                    border={false}
                                    showSocials={false}
                                    showTokenAddress={false}
                                    showQuickBuy={false}
                                    columns={['sidebar']}
                                    percentageSize="small"
                                    percentageStyle={true}
                                    isMobile={false}
                                    showTableHeaderBorder={true}
                                    showTableHeader={false}
                                    enableOverflowX={false}
                                    showPumpFunBadge={false}
                                />
                            </Panel>
                            <PanelResizeHandle className="relative z-[11] hover:z-[999999] hover:h-[10px] hover:bg-neutral-900 transition-all duration-200 group">
                                <MdDragIndicator className="absolute  rotate-90 translate-x-1/2 right-1/2 -translate-y-1/2 top-1/2 group-hover:text-neutral-text text-neutral-text-dark" />
                            </PanelResizeHandle>
                        </>
                    )}
                    {activeTabs.includes('Watchlist') && tabs.includes('Watchlist') && (
                        <Panel id="middle" order={2} minSize={20}>
                            <FavouritesPanel showBorder={false} />
                        </Panel>
                    )}
                    {activeTabs.length > 1 && (
                        <PanelResizeHandle className="relative z-[11] hover:z-[999999] hover:h-[10px] hover:bg-neutral-900 transition-all duration-200 group">
                            <MdDragIndicator className="absolute  rotate-90 translate-x-1/2 right-1/2 -translate-y-1/2 top-1/2 group-hover:text-neutral-text text-neutral-text-dark" />
                        </PanelResizeHandle>
                    )}
                    {activeTabs.includes('Alpha Feed') && tabs.includes('Alpha Feed') && (
                        <Panel id="bottom" order={3} minSize={20}>
                            <AlphaFeedPanel showBorder={false} />
                        </Panel>
                    )}
                </PanelGroup>
                {/* <div className="flex-1 max-h-full  overflow-hidden flex flex-col divide-y divide-border">
                    {activeTabs.includes('Trending') && tabs.includes('Trending') && (
                        <div className="flex-1 bg-black max-h-full overflow-hidden">
                            <TrendingPanel
                                showFavouriteButton={true}
                                size="extra-small"
                                rounded={false}
                                border={false}
                                showSocials={false}
                                showTokenAddress={false}
                                showQuickBuy={false}
                                columns={['sidebar']}
                                percentageSize="small"
                                percentageStyle={true}
                                isMobile={false}
                                showTableHeaderBorder={true}
                                showTableHeader={false}
                                enableOverflowX={false}
                                nameWidth="7rem"
                            />
                        </div>
                    )}
                    {activeTabs.includes('Watchlist') && tabs.includes('Watchlist') && (
                        <div className="flex-1 bg-black max-h-full overflow-hidden">
                            <FavouritesPanel showBorder={false} />
                        </div>
                    )}
                    {activeTabs.includes('Alpha Feed') && tabs.includes('Alpha Feed') && (
                        <div className="flex-1 bg-black max-h-full overflow-hidden">
                            <AlphaFeedPanel showBorder={false} />
                        </div>
                    )}
                </div> */}
            </div>
        </div>
    )
}

export default SidePanel
