/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ChartOptions, ChartData } from 'chart.js'
import { Line } from 'react-chartjs-2'
import useUnstakingQueueData from '@/hooks/data/useUnstakingQueueData'
import { generateChartData, generatePastChartData } from '@/utils/unstaking'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface ChartProps {
    data?: UnstakingChartDataPoint[]
    isLoading?: boolean
    isMobile?: boolean
}

const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
        tooltip: {
            backgroundColor: '#101010',
            titleColor: '#dddddd',
            bodyColor: '#dddddd',
            borderColor: '#191919',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
                label: context => {
                    const value = context.parsed.y
                    return `${context.dataset.label}: ${value.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })} HYPE`
                },
            },
        },
    },
    scales: {
        x: {
            type: 'category',
            grid: {
                color: '#191919',
                lineWidth: 1,
            },
            ticks: {
                color: '#656565',
                font: {
                    size: 11,
                },
                maxTicksLimit: 8,
                callback: function (value) {
                    const label = this.getLabelForValue(Number(value))
                    const date = new Date(label)
                    return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                    })
                },
            },
            border: {
                color: '#191919',
            },
        },
        y: {
            grid: {
                color: '#191919',
                lineWidth: 1,
            },
            ticks: {
                color: '#656565',
                font: {
                    size: 11,
                },
                callback: function (value) {
                    return Number(value).toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    })
                },
            },
            border: {
                color: '#191919',
            },
        },
    },
    interaction: {
        intersect: false,
        mode: 'index',
    },
}

const UnstakingQueueChart: React.FC<ChartProps> = ({ data: propData, isLoading: propLoading = false }) => {
    const { data: apiData, isLoading: apiLoading } = useUnstakingQueueData()
    const [currentTime, setCurrentTime] = useState(Date.now())

    const isLoading = propLoading || apiLoading
    const data = propData || apiData

    // Update time every minute for real-time chart updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now())
        }, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [])

    const chartData = useMemo(() => {
        if (!data || !('queue' in data)) return []
        return generateChartData(data.queue, data.total_wei, currentTime)
    }, [data, currentTime])

    // Generate past chart data (last 30 days of historical unlocks)
    const pastChartData = useMemo(() => {
        if (!data || !('queue' in data)) return { pastUnlocks: [] }
        return generatePastChartData(data.queue, currentTime, 30)
    }, [data, currentTime])

    const chartConfig: ChartData<'line'> = useMemo(() => {
        // Combine both past and upcoming data labels
        const pastLabels = pastChartData.pastUnlocks.map(point => point.date)
        const upcomingLabels = chartData.map(point => point.date)
        const allLabels = [...pastLabels, ...upcomingLabels]

        // Create datasets for both past and upcoming data
        const datasets = []

        // Past unlocks dataset
        if (pastChartData.pastUnlocks.length > 0) {
            const pastData = new Array(allLabels.length).fill(null)
            pastChartData.pastUnlocks.forEach((point, index) => {
                pastData[index] = point.amount
            })

            datasets.push({
                label: 'Past Unlocks',
                data: pastData,
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointBackgroundColor: '#FF6B6B',
                pointBorderColor: '#FF6B6B',
                pointRadius: 2,
                pointHoverRadius: 4,
                spanGaps: false,
            })
        }

        // Upcoming unstaking queue dataset
        if (chartData.length > 0) {
            const upcomingData = new Array(allLabels.length).fill(null)
            chartData.forEach((point, index) => {
                upcomingData[pastLabels.length + index] = point.balance
            })

            datasets.push({
                label: 'Pending Amount',
                data: upcomingData,
                borderColor: '#80FF6C',
                backgroundColor: 'rgba(128, 255, 108, 0.1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointBackgroundColor: '#80FF6C',
                pointBorderColor: '#80FF6C',
                pointRadius: 3,
                pointHoverRadius: 5,
                spanGaps: false,
            })
        }

        return {
            labels: allLabels,
            datasets,
        }
    }, [chartData, pastChartData])

    if (isLoading) {
        return (
            <div className="flex flex-col border border-border rounded-lg bg-black overflow-hidden">
                <div className="p-3 border-b border-border">
                    <h3 className="text-xs font-semibold text-neutral-text-dark uppercase">Unstaking Queue Chart</h3>
                </div>
                <div className="w-full h-[400px] flex items-center justify-center">
                    <div className="text-neutral-text-dark text-xs">Loading chart data...</div>
                </div>
            </div>
        )
    }

    const totalPending = chartData[0]?.balance || 0

    return (
        <div className="flex flex-col border border-border rounded-lg bg-black overflow-hidden">
            <div className="p-3 border-b border-border">
                <h3 className="text-xs font-semibold text-neutral-text-dark uppercase">Unstaking Queue Chart</h3>
                <div className="mt-2 flex items-center gap-6">
                    {pastChartData.pastUnlocks.length > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-red-400"></div>
                            <span className="text-xs text-neutral-text-dark">Past Unlocks</span>
                        </div>
                    )}
                    {totalPending > 0 && (
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-0.5 bg-positive"></div>
                            <span className="text-xs text-neutral-text-dark">Upcoming Unlocks</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-3">
                <div className="w-full h-[400px]">
                    <Line options={options} data={chartConfig} />
                </div>
            </div>
        </div>
    )
}

export default UnstakingQueueChart
