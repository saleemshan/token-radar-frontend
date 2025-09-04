import MobileReturnButton from '../MobileReturnButton'
import { FaSearch } from 'react-icons/fa'
import Link from 'next/link'
import { FaChessKnight, FaNewspaper, FaUsers } from 'react-icons/fa6'
import { HiWallet } from 'react-icons/hi2'

const CrushPanel = ({ handleClosePanel }: { handleClosePanel: () => void }) => {
    return (
        <div className="fixed inset-0 bg-black z-[101] p-3 flex flex-col gap-3 overflow-hidden">
            <MobileReturnButton label="Crush" onClick={handleClosePanel} />

            <div className="flex flex-col gap-3 pt-3">
                <div className="grid grid-cols-4 gap-4">
                    {process.env.NEXT_PUBLIC_ENABLE_ATS === 'true' && (
                        <Link href={`/ats`} className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}>
                            <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                <FaChessKnight className="text-xl" />
                            </div>
                            <span className="text-2xs">Strategies</span>
                        </Link>
                    )}
                    {process.env.NEXT_PUBLIC_ENABLE_NEWS_TRADING === 'true' && (
                        <Link
                            href={`/news-trading`}
                            className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}
                        >
                            <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                <FaNewspaper className="text-xl" />
                            </div>
                            <span className="text-2xs">News Trading</span>
                        </Link>
                    )}
                    {process.env.NEXT_PUBLIC_ENABLE_REFERRAL === 'true' && (
                        <Link href={`/referral`} className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}>
                            <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                                <FaUsers className="text-xl" />
                            </div>
                            <span className="text-2xs">Referral</span>
                        </Link>
                    )}

                    <Link href={`/mobile/wallet`} className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}>
                        <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                            <HiWallet className="text-xl" />
                        </div>
                        <span className="text-2xs">Assets</span>
                    </Link>
                    <Link href={`/mobile/search`} className={`flex flex-col gap-1 items-center justify-center apply-transition text-neutral-text `}>
                        <div className="rounded-lg border border-border items-center justify-center w-12 h-12 min-w-12 min-h-12 flex">
                            <FaSearch className="text-xl" />
                        </div>
                        <span className="text-2xs">Search</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default CrushPanel
