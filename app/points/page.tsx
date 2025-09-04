'use client'
import withAuth from '@/hoc/withAuth'
import React, { useEffect, useRef, useState } from 'react'
// import { useRouter } from 'next/navigation'
import { FaCheck, FaCopy, FaPencil } from 'react-icons/fa6'
import ReferralRewardModal from '@/components/modal/ReferralRewardModal'
import usePreventZoomOnMobile from '@/hooks/usePreventMobileZoom'
import useUserReferralDownlines from '@/hooks/data/useUserReferralDownlines'
import TextLoading from '@/components/TextLoading'
import Button from '@/components/ui/Button'
import { BASE_URL } from '@/utils/string'
import useUserReferralCode from '@/hooks/data/useUserReferralCode'
import Spinner from '@/components/Spinner'
import CustomizeReferralCodeModal from '@/components/modal/CustomizeReferralCodeModal'
import UserXpBar from '@/components/UserXpBar'
import useUserReferralLeaderboardData from '@/hooks/data/useReferralLeaderboardData'
import useUserReferralPointsData from '@/hooks/data/useReferralPointsData'
import { getNumberWithCommas } from '@/utils/price'
import Tooltip from '@/components/Tooltip'
import { usePrivy } from '@privy-io/react-auth'
import Tag from '@/components/Tag'
import Image from 'next/image'
import { toast } from 'react-toastify'
import { getSlicedAddress } from '@/utils/crypto'
import useHaptic from '@/hooks/useHaptic'

const PointsPage = () => {
    usePreventZoomOnMobile()

    // const router = useRouter()
    const [isKol, setIsKol] = useState(false)
    const [copyClicked, setCopyClicked] = useState(false)
    const { user } = usePrivy()
    const { triggerHaptic } = useHaptic()

    const { data: userReferralDownlines, isLoading: isDownlinesLoading } = useUserReferralDownlines()
    const { data: userReferralCode, isLoading: isCodeLoading } = useUserReferralCode()
    const { data: leaderboardData, isLoading: isLeaderboardLoading } = useUserReferralLeaderboardData()
    const { data: pointsData, isLoading: isPointsDataLoading } = useUserReferralPointsData()

    // useEffect(() => {
    //     console.log({ pointsData, leaderboardData, userReferralCode, userReferralDownlines })
    // }, [pointsData, leaderboardData, userReferralCode, userReferralDownlines])

    const rewardModal = useRef<{
        toggleModal: (targetIndex?: number) => void
    }>(null)
    const customizeReferralCodeModal = useRef<{
        toggleModal: () => void
    }>(null)

    const handleToggleModal = () => {
        if (rewardModal) rewardModal.current?.toggleModal()
    }

    useEffect(() => {
        if (userReferralCode) {
            setIsKol(userReferralCode.isKol)
        }
    }, [userReferralCode])

    return (
        <div className="  mx-auto flex-1 flex flex-col overflow-hidden  p-3 max-h-full overflow-y-auto ">
            <div className="flex flex-col max-w-7xl mx-auto w-full items-center  gap-4 md:py-6 ">
                <div className="flex flex-col w-full gap-2 relative pb-4 min-h-fit">
                    <div className="flex items-center gap-2">
                        {/* <button
                            type="button"
                            onClick={() => {
                                if (window.history.length > 1) {
                                    router.back()
                                } else {
                                    router.replace('/')
                                }
                            }}
                            className={`flex md:hidden bg-table-odd border border-border rounded-lg px-2 gap-2 w-7 min-w-7 h-7  min-h-7 items-center justify-center hover:bg-neutral-900  apply-transition hover:text-neutral-text text-neutral-text  `}
                        >
                            <FaChevronLeft className="block " />
                        </button> */}
                        <div className="text-white text-xl md:text-2xl font-bold leading-6 ">Crush Points</div>
                        <div className="flex items-center gap-2 ml-auto justify-end">
                            <Button
                                className="text-sm text-neutral-text  overflow-hidden"
                                variant="neutral"
                                height="h-8 min-h-8 "
                                uppercase={false}
                                onClick={event => {
                                    triggerHaptic(50)
                                    if (isCodeLoading) return
                                    event.stopPropagation()
                                    navigator.clipboard.writeText(`${BASE_URL}?ref=${userReferralCode?.referCode}`)
                                    toast.success('Referral link copied to clipboard successfully.')
                                    setCopyClicked(true)
                                    setTimeout(() => {
                                        setCopyClicked(false)
                                    }, 3000)
                                }}
                            >
                                {isCodeLoading ? (
                                    <Spinner />
                                ) : (
                                    <span className="max-w-[10rem] overflow-hidden truncate">{userReferralCode?.referCode}</span>
                                )}
                                {copyClicked ? <FaCheck className="text-sm" /> : <FaCopy className="text-sm" />}
                            </Button>
                            <button
                                type="button"
                                onClick={() => {
                                    customizeReferralCodeModal.current?.toggleModal()
                                }}
                                className={`flex mr-2  bg-table-odd border border-border rounded-lg ml-auto  px-1 gap-2 w-8 min-w-8 h-8  min-h-8 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text`}
                            >
                                <FaPencil className="text-xs" />
                            </button>
                        </div>
                    </div>
                    <p className="  text-xs md:text-sm  md:w-[40%] text-neutral-text/80">
                        The more your trade and the more people you refer, the more Crush points you accumulate. Crush points also allow you to level
                        up, so you earn bonus comissions from your referrals.
                        <span onClick={handleToggleModal} className=" underline cursor-pointer ml-1">
                            view rewards details here 🎁
                        </span>
                        .
                    </p>
                </div>

                {/* border-border border p-3 bg-neutral-950 */}
                <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 rounded-lg  overflow-hidden min-h-fit">
                    <div className="col-span-full flex gap-3 w-full">
                        <div className="flex-1 border-t shadow-sm shadow-black border-[#241c1e] bg-[#120e0f] rounded-lg p-4 flex flex-col ">
                            <div className="pb-2 font-bold text-sm">Your Level</div>
                            <UserXpBar borderColor="#241c1e" backgroundColor="#0f0b0c" />
                        </div>
                    </div>

                    <div className="border-t shadow-sm shadow-black border-[#241c1e] bg-[#120e0f] rounded-lg  flex flex-col divide-y divide-[#241c1e] ">
                        <div className="pb-2 font-bold text-sm p-4">Pre Alpha</div>
                        <div className="grid grid-cols-2 divide-x divide-[#241c1e] ">
                            <div className="p-4 flex flex-col gap-1">
                                <div className="text-xs text-neutral-text-dark">Referrals Points</div>
                                {isPointsDataLoading ? (
                                    <TextLoading className="min-h-3 max-h-3 " />
                                ) : (
                                    <div className="text-base">{getNumberWithCommas(pointsData?.seasonPoints?.referralPoints ?? 0, true)}</div>
                                )}
                            </div>
                            <div className="p-4 flex flex-col gap-1">
                                <div className="text-xs text-neutral-text-dark">Trading Points</div>
                                {isPointsDataLoading ? (
                                    <TextLoading className="min-h-3 max-h-3 " />
                                ) : (
                                    <div className="text-base">{getNumberWithCommas(pointsData?.seasonPoints?.tradePoints ?? 0, true)}</div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className=" border shadow-sm shadow-black border-[#501121] bg-black overflow-hidden rounded-lg flex flex-col  relative p-4">
                        {/* <div className="bg-gradient-to-bl from-primary/10  to-primary/0 absolute inset-0 blur-sm"></div>
                        <div className="bg-gradient-to-br from-primary/10  to-primary/0 absolute inset-0 blur-sm"></div> */}
                        <Image
                            src="/images/wave.jpg"
                            alt="wave background"
                            width={1000}
                            height={300}
                            className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
                        />
                        <div className=" font-bold text-base text-center relative text-neutral-text/80">Crush Points</div>
                        <div className="flex flex-1 justify-center items-center relative">
                            {isPointsDataLoading ? (
                                <TextLoading className="min-h-3 max-h-3 " />
                            ) : (
                                <div className="relative">
                                    <div className="text-4xl font-bold tracking-wider text-primary absolute inset-0 flex items-center justify-center">
                                        {getNumberWithCommas(pointsData?.seasonPoints?.totalPoints ?? 0, true)}
                                    </div>
                                    <div className="text-4xl font-bold tracking-wider text-primary blur-md">
                                        {getNumberWithCommas(pointsData?.seasonPoints?.totalPoints ?? 0, true)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col min-h-fit overflow-hidden flex-1 w-full mt-6 ">
                    <div className="  overflow-hidden flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className=" flex flex-col  overflow-hidden flex-1 gap-3">
                            <div className="flex flex-col w-full gap-2">
                                <div className="text-white text-base md:text-lg font-bold leading-6 ">Leaderboard</div>
                                <p className="  text-xs md:text-sm h-10 text-neutral-text/80">
                                    The season leaderboard highlights users with the highest trade and referral points on the platform.
                                </p>
                            </div>

                            <div className="flex flex-col flex-1 bg-neutral-900 rounded-lg overflow-hidden border-t shadow-sm shadow-black border-[#241c1e] ">
                                <div className="p-3 bg-[#120e0f] font-bold">Season Leaderboard</div>
                                <div className="flex-1 overflow-y-auto points-scrollbar-thumb min-h-[30vh] max-h-[30vh] divide-y divide-neutral-800 bg-neutral-950 ">
                                    {isLeaderboardLoading ? (
                                        <>
                                            {Array.from({ length: 12 }).map((_, index) => {
                                                return (
                                                    <div
                                                        className="px-3 h-[2.5rem] min-h-[2.5rem] flex items-center justify-between w-full "
                                                        key={index}
                                                    >
                                                        <TextLoading className="w-full min-h-[8px] flex items-center justify-center" />
                                                    </div>
                                                )
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            {leaderboardData && leaderboardData.length > 0 ? (
                                                leaderboardData.map((data, index) => {
                                                    return (
                                                        <div
                                                            className={`p-3 flex items-center justify-between w-full gap-3 ${
                                                                user?.id === data.privyId ? 'bg-[#120e0f] sticky bottom-0 z-50' : ''
                                                            }`}
                                                            key={`${data.privyId}-${index}`}
                                                        >
                                                            {/* <div className="text-xs">{data.privyId}</div> */}{' '}
                                                            <div className="text-xs text-neutral-text/80 flex items-center ">
                                                                <span className="w-8">{index + 1}</span>
                                                                <span className="mr-2">
                                                                    {data.wallet ? getSlicedAddress(data.wallet, 4, '...') : data.referCode}
                                                                </span>
                                                                {user?.id === data.privyId && <Tag variant="negative">You</Tag>}
                                                            </div>
                                                            {/* <div className="text-xs ">{data.seasonPoints?.total}</div> */}
                                                            <div className="text-xs ">
                                                                {getNumberWithCommas(data.seasonPoints?.totalPoints, true)}
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            ) : (
                                                <div className="p-3 text-neutral-text-dark">No data</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className=" flex flex-col  overflow-hidden flex-1 gap-3">
                            <div className="flex flex-col w-full gap-2">
                                <div className="text-white text-base md:text-lg font-bold leading-6 ">Referrals</div>
                                <p className="  text-xs md:text-sm h-10 text-neutral-text/80">List of users that register under your referral code</p>
                            </div>

                            <div className="flex flex-col flex-1 bg-neutral-900 rounded-lg overflow-hidden border-t shadow-sm shadow-black border-[#241c1e] ">
                                <div className="p-3  bg-[#120e0f] font-bold">Referrals</div>
                                <div className="flex-1 overflow-y-auto points-scrollbar-thumb min-h-[30vh] max-h-[30vh] divide-y divide-neutral-800 bg-neutral-950">
                                    {isDownlinesLoading ? (
                                        <>
                                            {Array.from({ length: 12 }).map((_, index) => {
                                                return (
                                                    <div
                                                        className="px-3 h-[2.5rem] min-h-[2.5rem] flex items-center justify-between w-full "
                                                        key={index}
                                                    >
                                                        <TextLoading className="w-full min-h-[8px] flex items-center justify-center" />
                                                    </div>
                                                )
                                            })}
                                        </>
                                    ) : (
                                        <>
                                            {userReferralDownlines?.downlines ? (
                                                <>
                                                    {Object.entries(userReferralDownlines.downlines).map(([tier, users], index) => (
                                                        <div key={index} className="flex flex-col divide-y divide-neutral-800">
                                                            {users.map((user, index) => (
                                                                <div
                                                                    key={`${user.privyId}-${index}`}
                                                                    className="p-3 flex items-center justify-between w-full gap-3 "
                                                                >
                                                                    <div className="text-xs text-neutral-text/80 flex items-center ">
                                                                        <span className="w-8">{index + 1}</span>
                                                                        <span>
                                                                            {user.wallet ? getSlicedAddress(user.wallet, 4, '...') : user.referCode}
                                                                        </span>
                                                                    </div>

                                                                    <Tooltip text={`Tier ${tier}`} className="">
                                                                        <span className="text-xs">#{tier}</span>
                                                                    </Tooltip>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div className="p-3 text-neutral-text-dark">No downline</div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CustomizeReferralCodeModal ref={customizeReferralCodeModal}></CustomizeReferralCodeModal>
            <ReferralRewardModal isKol={isKol} ref={rewardModal}></ReferralRewardModal>
        </div>
    )
}

export default withAuth(PointsPage)
