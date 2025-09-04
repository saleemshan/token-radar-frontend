// import { getTimeComparison } from '@/utils/time';
import React from 'react'
// import PercentageChange from '../PercentageChange';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import TokenAnalyticsPanel from '../panel/TokenAnalyticsPanel'
import SocialPanel from '../panel/SocialPanel'
import SecurityPanel from '../panel/SecurityPanel'
import useTokenSecurityData from '@/hooks/data/useTokenSecurityData'

ChartJS.register(ArcElement, Tooltip, Legend)

const InfoTab = ({ tokenAddress, tokenData, chain }: { tokenAddress: string; chain: string; tokenData: Token | undefined }) => {
    const { data: tokenSecurityData, isLoading: isTokenSecurityLoading } = useTokenSecurityData(chain, tokenAddress)

    return (
        <div className="flex-1  xl:max-h-[60vh] min-h-fit overflow-hidden  flex flex-col xl:flex-row gap-3">
            <div className="flex flex-col w-full flex-1  overflow-hidden min-h-full">
                <TokenAnalyticsPanel tokenData={tokenData} address={tokenAddress} chain={chain as string} />
                <SecurityPanel data={tokenSecurityData} isLoading={isTokenSecurityLoading} />
                <SocialPanel tokenData={tokenData} />
            </div>
        </div>
    )
}

export default InfoTab
