'use client'

import MobileMemecoins from '@/components/mobile/MobileMemecoins'
import SidePanel from '@/components/panel/SidePanel'
import TrendingPanel from '@/components/panel/TrendingPanel'
import useIsMobile from '@/hooks/useIsMobile'
import usePreventZoomOnMobile from '@/hooks/usePreventMobileZoom'
import { MdDragIndicator } from 'react-icons/md'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'

export default function MemecoinsPage() {
    usePreventZoomOnMobile()
    const isMobile = useIsMobile()

    return (
        <>
            {/* Desktop Memecoins */}
            {!isMobile && (
                <div className="flex-1 w-full min-h-full flex flex-col max-h-full overflow-hidden">
                    <PanelGroup autoSaveId="homePage" direction="horizontal" className="min-w-full min-h-full max-h-full overflow-hidden">
                        <Panel
                            id="parentLeft"
                            className="relative z-10 flex h-full overflow-hidden  w-full"
                            style={{
                                minWidth: '320px',
                                // maxWidth: '300px',
                            }}
                            minSize={15}
                            defaultSize={15}
                        >
                            <SidePanel />
                        </Panel>
                        <PanelResizeHandle className="block relative z-[50] hover:z-[999999] hover:w-[10px] hover:bg-neutral-900 transition-all duration-200 group">
                            <MdDragIndicator className="absolute  translate-x-1/2 right-1/2 bottom-1/2 translate-y-1/2 group-hover:text-neutral-text text-neutral-text-dark" />
                        </PanelResizeHandle>
                        <Panel id="parentRight" className="relative z-10 flex h-full overflow-hidden  w-full" minSize={50} defaultSize={85}>
                            <div className=" flex-1 max-h-full overflow-hidden ">
                                <TrendingPanel
                                    columns={[
                                        'token',
                                        'created',
                                        'price',
                                        'liq',
                                        'mcap',
                                        'holders',
                                        'txs',
                                        'volume24h',
                                        'priceChange1h',
                                        'priceChange24h',
                                        'quickBuy',
                                    ]}
                                    size="small"
                                    border={false}
                                    rounded={false}
                                />
                            </div>
                            {/* <div className="min-h-[200vh]">aw</div> */}
                        </Panel>
                    </PanelGroup>
                </div>
            )}

            {/* Mobile Memecoins */}
            <MobileMemecoins />
        </>
    )
}
