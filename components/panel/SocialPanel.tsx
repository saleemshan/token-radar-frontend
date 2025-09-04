import useTokenTopInfluencersData from '@/hooks/data/useTokenTopInfluencersData'
import React, { useEffect, useState } from 'react'
// import Tooltip from './Tooltip';
import { FaArrowTrendDown, FaArrowTrendUp, FaChevronDown, FaCircleInfo } from 'react-icons/fa6'
import ImageFallback from '../ImageFallback'
import TextLoading from '../TextLoading'
import Tooltip from '../Tooltip'
// import useTokenTwitterRecycleData from '@/hooks/data/useTwitterRecycleData';
// import Spinner from './Spinner';
import useTokenSocialData from '@/hooks/data/useTokenSocialData'
import { calculateDifferencesAndPercentageChange } from '@/utils/socialDominance'
import PercentageChange from '../PercentageChange'
import { formatNumberWithCommas } from '@/utils/string'

const SocialPanel = ({ tokenData }: { tokenData: Token | undefined }) => {
    const { data, isLoading } = useTokenTopInfluencersData(tokenData?.symbol ?? '')
    const [showDetails, setShowDetails] = useState(false)

    // const [tokenTwitterId, setTokenTwitterId] = useState<string|undefined>(undefined)

    //   useEffect(() => {
    //     if (tokenData) {
    //       const twitterUrl = tokenData?.links?.x;
    //       if (twitterUrl) {
    //         const splitTwitterUrl = twitterUrl.split('/');
    //         const twitterId = splitTwitterUrl[splitTwitterUrl.length - 1];
    //         if (twitterId) {
    //           setTokenTwitterId(twitterId);
    //         }
    //       }
    //     }
    //   }, [tokenData]);

    // const { data: twitterRecycleData, isLoading: twitterRecycleDataIsLoading } =
    //   useTokenTwitterRecycleData(tokenTwitterId);

    const { data: tokenSocialData } = useTokenSocialData(tokenData?.symbol ?? '')
    const { data: tokenSocialHourlyData } = useTokenSocialData(tokenData?.symbol ?? '', 'hour')

    const [latestTwoTimeSeries, setLatestTwoTimeSeries] = useState<IndividualTS[]>([])
    const [latestTwoTimeHourlySeries, setLatestTwoTimeHourlySeries] = useState<IndividualTS[]>([])

    const [calculatedData, setCalculatedData] = useState<SocialAnalytic | undefined>(undefined)
    const [calculatedHourlyData, setCalculatedHourlyData] = useState<SocialAnalytic | undefined>(undefined)

    const getSocialUrl = (topInfluencer: TopInfluencer) => {
        const network = topInfluencer.network.toLowerCase() //youtube, twitter, tiktok, reddit, news;
        const identifier = topInfluencer.identifier?.split('::')[1]

        if (network === 'twitter') {
            return `https://twitter.com/i/user/${identifier}`
            // return `https://x.com/${topInfluencer.name}`;
        }

        if (network === 'youtube') {
            return `https://www.youtube.com/channel/${identifier}`
        }

        if (network === 'tiktok') {
            return `https://www.tiktok.com/@${identifier}`
        }
        if (network === 'reddit') {
            return `https://www.reddit.com/user/${identifier}`
        }
        if (network === 'news') {
        }

        return 'https://x.com'
    }

    useEffect(() => {
        if (tokenSocialData?.timeSeries && tokenSocialData?.timeSeries.length > 0) {
            setLatestTwoTimeSeries(tokenSocialData?.timeSeries.slice(-2))
        }
    }, [tokenSocialData])

    useEffect(() => {
        if (tokenSocialHourlyData?.timeSeries && tokenSocialHourlyData?.timeSeries.length > 0) {
            setLatestTwoTimeHourlySeries(tokenSocialHourlyData?.timeSeries.slice(-2))
        }
    }, [tokenSocialHourlyData])

    useEffect(() => {
        if (latestTwoTimeSeries.length > 0) {
            const data = calculateDifferencesAndPercentageChange(latestTwoTimeSeries)
            setCalculatedData(data)
        }
    }, [latestTwoTimeSeries])

    useEffect(() => {
        if (latestTwoTimeHourlySeries.length > 0) {
            const data = calculateDifferencesAndPercentageChange(latestTwoTimeHourlySeries)
            setCalculatedHourlyData(data)
        }
    }, [latestTwoTimeHourlySeries])

    return (
        <div className=" w-full  flex flex-col gap-2 overflow-hidden min-h-fit bg-black relative ">
            <div className=" flex-1 flex flex-col  h-full bg-black overflow-y-hidden overflow-x-auto">
                <button
                    className={`flex  p-3 border-border gap-3  flex-wrap justify-between text-white text-base items-center border-b`}
                    onClick={() => {
                        setShowDetails(!showDetails)
                    }}
                >
                    <div className=" leading-6  flex-1 bg-black font-semibold text-left text-sm flex items-center gap-2">
                        <div>Social Analysis</div>
                        <Tooltip text="Check whether the Twitter account has been recycled or reused">
                            <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                        </Tooltip>
                    </div>

                    <FaChevronDown className={`apply-transition text-2xs text-neutral-text-dark ${showDetails ? 'rotate-180' : ''} `} />
                </button>
                {showDetails && (
                    <div className="w-full flex flex-col p-3 gap-2 ">
                        <div className=" flex flex-col text-xs gap-2">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1 text-neutral-text-dark">
                                    <div>Mentions</div>
                                    <Tooltip text="Hourly social mentions">
                                        <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                    </Tooltip>
                                </div>
                                {calculatedHourlyData ? (
                                    <div className="flex items-center ">
                                        <div className="pr-1">{formatNumberWithCommas(calculatedHourlyData.currentMentions)}</div>
                                        <PercentageChange
                                            size="extrasmall"
                                            padding=""
                                            width="min-w-10 max-w-10"
                                            percentage={
                                                calculatedHourlyData.mentionsPercentageChange
                                                    ? calculatedHourlyData.mentionsPercentageChange / 100
                                                    : 0
                                            }
                                        ></PercentageChange>

                                        {calculatedHourlyData && calculatedHourlyData.mentionsPercentageChange && (
                                            <>
                                                {calculatedHourlyData.mentionsPercentageChange > 0 ? (
                                                    <FaArrowTrendUp className="text-2xs  text-positive" />
                                                ) : (
                                                    <FaArrowTrendDown className="text-2xs  text-negative" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div>-</div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                    <div className="text-neutral-text-dark">Dominance</div>
                                    <Tooltip text="Daily social dominance">
                                        <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                                    </Tooltip>
                                </div>
                                {calculatedData ? (
                                    <div className="flex items-center ">
                                        <div className="pr-1">{calculatedData.currentSocialDominance}%</div>

                                        <PercentageChange
                                            size="extrasmall"
                                            width="min-w-10 max-w-10"
                                            padding=""
                                            percentage={
                                                calculatedData.socialDominancePercentageChange
                                                    ? calculatedData.socialDominancePercentageChange / 100
                                                    : 0
                                            }
                                        ></PercentageChange>

                                        {calculatedData && calculatedData.socialDominancePercentageChange && (
                                            <>
                                                {calculatedData.socialDominancePercentageChange > 0 ? (
                                                    <FaArrowTrendUp className="text-2xs  text-positive" />
                                                ) : (
                                                    <FaArrowTrendDown className="text-2xs  text-negative" />
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div>-</div>
                                )}
                            </div>
                        </div>

                        <div className=" text-xs text-neutral-text-dark">Top Influencer</div>
                        <div className="flex flex-col  p-2 border border-border rounded-lg">
                            {isLoading ? (
                                <>
                                    {Array.from({ length: 1 }).map((_, index) => {
                                        return <TextLoading key={index} className="w-full" />
                                    })}
                                </>
                            ) : (
                                <div className="grid grid-cols-7 overflow-hidden text-xs text-neutral-text gap-2">
                                    {data && data.length > 0 ? (
                                        data.map(topInfluencer => {
                                            return (
                                                <a
                                                    href={getSocialUrl(topInfluencer)}
                                                    target="_blank"
                                                    key={topInfluencer.lunar_id}
                                                    className="flex items-center gap-1 relative group"
                                                >
                                                    <Tooltip text={topInfluencer.name}>
                                                        <div className="bg-black  min-w-8 min-h-8 max-w-8 max-h-8 rounded-full border border-border overflow-hidden relative flex items-center justify-center">
                                                            <ImageFallback
                                                                src={topInfluencer.avatar}
                                                                alt={`influencers`}
                                                                width={200}
                                                                height={200}
                                                                className=" w-full h-full object-cover object-center"
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                </a>
                                            )
                                        })
                                    ) : (
                                        <span className="text-xs">-</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SocialPanel
