// 'use client'

// import MemecoinStrategiesPanel from '@/components/panel/SpotStrategiesPanel'
// import NewsStrategiesPanel from '@/components/panel/PerpsStrategiesPanel'
// import React, { useState } from 'react'

// const StrategyPage = () => {
//     const tabs = ['News', 'Memecoins']
//     const [activeTab, setActiveTab] = useState(tabs[0])

//     return (
//         <div className=" w-full flex-1 overflow-y-auto">
//             <div className="flex gap-3 items-center p-2 pb-0">
//                 <div className=" text-white text-lg md:text-xl font-bold leading-6 ">Strategies</div>

//                 <div className="flex overflow-x-auto no-scrollbar gap-1  border border-border rounded-lg  justify-end  p-1 md:w-fit ml-auto">
//                     {tabs.map(tab => {
//                         return (
//                             <button
//                                 key={tab}
//                                 onClick={() => {
//                                     setActiveTab(tab)
//                                 }}
//                                 className={` flex px= text-nowrap w-full md:w-fit items-center rounded-md justify-center text-xs py-1 md:h-8 md:min-h-8 hover:bg-neutral-900 duration-200 transition-all  min-w-24  font-semibold ${
//                                     activeTab === tab ? 'bg-neutral-900 text-neutral-text' : 'bg-black text-neutral-text-dark/70'
//                                 }`}
//                             >
//                                 {tab}
//                             </button>
//                         )
//                     })}
//                 </div>
//             </div>

//             {activeTab === 'News' && <NewsStrategiesPanel setShowStrategyPanel={() => {}} showTabs={false} />}
//             {activeTab === 'Memecoins' && <MemecoinStrategiesPanel setShowStrategyPanel={() => {}} showTabs={false} />}
//         </div>
//     )
// }

// export default StrategyPage
