'use client'
import React, { useState } from 'react'
// import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement } from 'chart.js'
import Spinner from '@/components/Spinner'

import { FaChevronDown, FaCircleInfo, FaThumbsDown, FaThumbsUp } from 'react-icons/fa6'
import { getScoreColor } from '@/utils/textColor'
import Tooltip from '@/components/Tooltip'

Chart.register(ArcElement)

const SecurityPanel = ({ data, isLoading }: { data: TokenSecurity | undefined; isLoading: boolean }) => {
    const [showSecurityDetails, setShowSecurityDetails] = useState(false)
    return (
        <div className=" w-full flex flex-col gap-2 overflow-hidden min-h-fit bg-black relative ">
            <div className=" flex-1 flex flex-col  border-border  h-full bg-black overflow-y-hidden overflow-x-auto">
                <button
                    className={`flex  p-3 border-border border-b gap-3  flex-wrap justify-between text-white text-base items-center ${
                        showSecurityDetails ? ' border-b' : ''
                    }`}
                    onClick={() => {
                        if (!data) return
                        setShowSecurityDetails(!showSecurityDetails)
                    }}
                >
                    <div className=" leading-6  flex-1 bg-black font-semibold text-left text-sm flex items-center gap-2">
                        <div>AI Security Score</div>
                        <Tooltip text="Security score is calculated by our LLM from analysing reports from some of the most popular token checkers such as rugcheck and others">
                            <FaCircleInfo className="text-2xs text-neutral-text-dark" />
                        </Tooltip>
                    </div>
                    {isLoading ? (
                        <Spinner />
                    ) : (
                        <>
                            {data && (
                                <div className="items-center flex gap-1">
                                    <span className={`text-base font-semibold ${getScoreColor(data.score)}`}>{data.score}</span>
                                    {/* <span className="text-xs -mt-1 text-neutral-text">/ 100</span> */}
                                </div>
                            )}
                        </>
                    )}

                    <FaChevronDown className={`apply-transition text-2xs text-neutral-text-dark ${showSecurityDetails ? 'rotate-180' : ''} `} />
                </button>

                {showSecurityDetails && (
                    <div className="flex flex-col h-full overflow-y-auto border-b border-border">
                        <div className="flex flex-col overflow-hidden">
                            {/* {data && (
                <div className="flex flex-col justify-center items-center relative text-white p-3 min-h-[200px] max-h-[200px] overflow-hidden border-b border-border">
                  <Doughnut
                    data={{
                      datasets: [
                        {
                          data: [data.score, 100 - data.score],
                          backgroundColor: ['#2563eb', '#000000'],
                          borderColor: '#2F2F2F',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          enabled: false,
                        },
                      },
                      rotation: -90,
                      circumference: 180,
                      cutout: '80%',
                      maintainAspectRatio: true,
                      responsive: true,
                    }}
                  />

                  <div className="absolute bottom-1/3 font-semibold text-lg">
                    {data.score} / 100
                  </div>
                </div>
              )} */}

                            <div className=" flex flex-col gap-2 h-full overflow-y-auto p-3">
                                {data?.metrics &&
                                    data.metrics.length > 0 &&
                                    data.metrics.map((metric, index) => {
                                        // if (metric.name === 'Top 10 Holders High Ownership')
                                        return (
                                            <div
                                                key={`${index}`}
                                                className=" flex justify-between items-center gap-3 relative overflow-hidden min-h-fit text-xs"
                                            >
                                                <div className="text-neutral-text-dark">{metric.name}</div>
                                                <div className={`flex items-center gap-2 `}>
                                                    <div className="text-right break-words ">{metric.value}</div>
                                                    {metric.pass ? (
                                                        <FaThumbsUp className="text-positive" />
                                                    ) : (
                                                        <FaThumbsDown className="text-negative" />
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}

                                {data && !data.metrics && <span>No security data is available.</span>}
                                {!data && <span>No security data is available.</span>}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SecurityPanel
