// 'use client'
// import NewsStrategyForm from '@/components/forms/NewsStrategyForm'
// import StrategyForm from '@/components/forms/OldStrategyForm'
// import MobileReturnButton from '@/components/MobileReturnButton'
// import { useSingleAtsData } from '@/hooks/data/useAtsData'
// // import { strategies } from '@/data/dummy/ats';
// import React, { useEffect } from 'react'

// const ATSEditPage = ({ params }: { params: { id: string } }) => {
//     const { data: atsData } = useSingleAtsData(params.id)

//     useEffect(() => {
//         console.log({ atsData })
//     }, [atsData])

//     if (atsData) {
//         return (
//             <div className="w-full flex-1 max-h-full p-3 flex flex-col overflow-y-auto min-h-fit ">
//                 <div className="md:max-w-xl mx-auto flex flex-col md:py-8 gap-3 max-h-full w-full flex-1 ">
//                     <MobileReturnButton label="Edit AI Strategy" />
//                     <div className="hidden md:block text-white text-xl md:text-2xl font-bold leading-6 ">Edit AI Strategy</div>
//                     {atsData.strategyType === 'newsTrading' ? (
//                         <NewsStrategyForm isEdit={true} strategy={atsData} />
//                     ) : (
//                         <StrategyForm strategy={atsData} isEdit={true} />
//                     )}
//                     <div className="pb-8"></div>
//                 </div>
//             </div>
//         )
//     }

//     return null // Optionally handle loading state with a loading indicator here
// }

// export default ATSEditPage
