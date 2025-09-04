// 'use client'

// import Input from '@/components/Input'
// import Spinner from '@/components/Spinner'
// import Button from '@/components/ui/Button'

// import withAuth from '@/hoc/withAuth'
// import useAtsData from '@/hooks/data/useAtsData'
// import Link from 'next/link'
// import React, { useEffect, useState } from 'react'
// import { FaArrowUp, FaGlobe, FaPlus } from 'react-icons/fa6'

// const ATSPage = () => {
//     const [filteredStrategies, setFilteredStrategies] = useState<Strategy[]>([])
//     const [initialStrategies, setInitialStrategies] = useState<Strategy[]>([])
//     const [searchInput, setSearchInput] = useState('')

//     const [page, setPage] = useState(1)
//     const [limit] = useState(12)
//     // Existing useEffect to load strategies, add this line within that block
//     const [totalPages, setTotalPages] = useState(1)

//     // Add handlers for page navigation
//     const handleNextPage = () => {
//         if (page < totalPages) setPage(page + 1)
//     }

//     const handlePreviousPage = () => {
//         if (page > 1) setPage(page - 1)
//     }

//     const { data, isLoading } = useAtsData(page, limit)

//     useEffect(() => {
//         if (data) {
//             // console.log({ data })
//             setTotalPages(data.pagination.totalPages ?? 1)
//             setInitialStrategies(data.strategies)
//             setFilteredStrategies(data.strategies)
//         }
//     }, [data])

//     useEffect(() => {
//         const filtered = initialStrategies.filter(strategy => strategy.strategyName.toLowerCase().includes(searchInput.toLowerCase()))
//         setFilteredStrategies(filtered)
//     }, [initialStrategies, searchInput])

//     return (
//         <div className=" w-full flex-1 overflow-y-auto p-3">
//             <div className=" max-w-7xl mx-auto flex flex-col md:py-8 gap-3">
//                 {/* <MobileReturnButton label="AI Strategies" /> */}
//                 {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:mb-24">
//           <div className="border border-border rounded-lg flex flex-col relative p-3 bg-table-odd hover:bg-neutral-900 apply-transition gap-1">
//             <div className="text-xs text-neutral-text-dark">Total Balance</div>
//             <div className="  text-base font-bold "> USD100,000</div>
//           </div>
//           <div className="border border-border rounded-lg flex flex-col relative p-3 bg-table-odd hover:bg-neutral-900 apply-transition gap-1">
//             <div className="text-xs text-neutral-text-dark"> Profit/Loss</div>
//             <div className=" text-positive text-base font-bold ">
//               {' '}
//               USD18,400.2
//             </div>
//           </div>
//           <div className="border border-border rounded-lg flex flex-col relative p-3 bg-table-odd hover:bg-neutral-900 apply-transition gap-1">
//             <div className="text-xs text-neutral-text-dark"> Active Agent</div>
//             <div className="  text-base font-bold ">
//               <span>3</span>
//               <span className="text-xs">/4</span>
//             </div>
//           </div>
//         </div> */}
//                 <div className=" text-white text-lg md:text-xl font-bold leading-6 ">AI Strategies</div>
//                 <div className="flex flex-col md:flex-row gap-3">
//                     <div className="relative flex-1">
//                         <Input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Search " />
//                     </div>

//                     <div className="flex items-center gap-3 w-full md:w-auto">
//                         <Button className="text-xs w-full" href={`/ats/explore`}>
//                             <FaGlobe />
//                             <span> Explore</span>
//                         </Button>
//                         <Button
//                             className="text-xs w-full whitespace-nowrap"
//                             onClick={() => {
//                                 localStorage.removeItem('presetAts')
//                             }}
//                             href={`/ats/create`}
//                         >
//                             <FaPlus />
//                             <span> New Strategy</span>
//                         </Button>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                     {isLoading && (
//                         <div className="col-span-full flex items-center justify-center">
//                             <Spinner />
//                         </div>
//                     )}
//                     {!isLoading &&
//                         filteredStrategies &&
//                         filteredStrategies.length > 0 &&
//                         filteredStrategies.map((agent, index) => {
//                             return (
//                                 <Link
//                                     href={`/ats/${agent.strategyId}`}
//                                     key={index}
//                                     className="border border-border rounded-lg flex flex-col relative p-3 min-h-[100px] md:min-h-[160px] bg-table-odd hover:bg-neutral-900 apply-transition"
//                                 >
//                                     <span className="absolute right-3 top-3 flex h-2 w-2">
//                                         <span
//                                             className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
//                                                 agent.isRunning ? 'bg-green-400' : 'bg-red-400'
//                                             }`}
//                                         ></span>
//                                         <span
//                                             className={`relative inline-flex rounded-full h-2 w-2 ${agent.isRunning ? 'bg-green-500' : 'bg-red-500'}`}
//                                         ></span>
//                                     </span>
//                                     <div className="pr-6 text-sm">{agent.strategyName}</div>
//                                     <div className="absolute right-2 bottom-2 flex items-center  justify-center p-1 border border-border bg-border rounded-md">
//                                         <FaArrowUp className=" rotate-45 text-neutral-text-dark" />
//                                     </div>
//                                 </Link>
//                             )
//                         })}
//                 </div>

//                 <div className="flex justify-center mt-4  items-center text-xs">
//                     <Button onClick={handlePreviousPage} disabled={page === 1} className="text-2xs">
//                         Prev
//                     </Button>

//                     <span className="mx-4 text-neutral-text-dark">
//                         Page {page} of {totalPages}
//                     </span>
//                     <Button onClick={handleNextPage} disabled={page === totalPages} className="text-2xs">
//                         Next
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default withAuth(ATSPage)
