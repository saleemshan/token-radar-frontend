// /* eslint-disable @typescript-eslint/no-unused-vars */
// 'use client'
// import StrategyForm from '@/components/forms/OldStrategyForm'
// import Image from 'next/image'
// import { aiAssistantChatData } from '@/data/dummy/aiassistant'
// // import AIAssistantForm from '@/components/forms/AIAssistantForm';
// // import AIAssistedStrategyForm from '@/components/forms/AIAssistedStrategyForm';

// import React, { Suspense, useEffect, useState } from 'react'
// import { FaPaperPlane, FaUser } from 'react-icons/fa6'
// import MobileReturnButton from '@/components/MobileReturnButton'
// import { useRouter } from 'next/navigation'

// const CreatePage = () => {
//     const router = useRouter()
//     const [preset, setPreset] = useState<PresetStrategy | undefined>(undefined)
//     const [loaded, setLoaded] = useState(false)

//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     const [formData, setFormData] = useState<any>(undefined)

//     // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
//     const handleFormDataupdate = (data: any) => {
//         setFormData(data)
//     }

//     // const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('manual');

//     useEffect(() => {
//         const localStoragePresetAts = localStorage.getItem('presetAts')

//         if (localStoragePresetAts) {
//             const localStoragePreset = JSON.parse(localStoragePresetAts) as PresetStrategy

//             if (localStoragePreset.enabled === false) {
//                 router.push(`/ats`)
//             }

//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             const statements =
//                 localStoragePreset &&
//                 localStoragePreset.extraInput &&
//                 localStoragePreset.extraInput.map(item => {
//                     return item.statement
//                 })

//             if (statements && statements.length > 0) {
//                 const mergedStatements = localStoragePreset.statements.map(statement => {
//                     const replacement = statements.find(localStatement => localStatement.type === statement.type)
//                     // Replace if found in localStorage, otherwise keep the existing
//                     return replacement ? replacement : statement
//                 })
//                 setPreset({
//                     ...localStoragePreset,
//                     name: `${localStoragePreset.name} copy`,
//                     statements: mergedStatements,
//                 })
//             } else {
//                 setPreset({
//                     ...localStoragePreset,
//                     name: `${localStoragePreset.name} copy`,
//                 })
//             }
//         }

//         setLoaded(true)
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [])

//     if (loaded) {
//         return (
//             <div className="w-full flex-1 max-h-full p-3 flex flex-col overflow-y-auto">
//                 <div className="max-w-5xl mx-auto flex flex-col md:py-8 gap-3 max-h-full w-full flex-1">
//                     <MobileReturnButton label="Create AI Strategy" />
//                     <div className="hidden md:block text-white text-xl md:text-2xl font-bold leading-6 ">Create AI Strategy</div>
//                     <StrategyForm
//                         strategy={
//                             {
//                                 strategyName: preset?.name ?? '',
//                                 description: preset?.description ?? '',
//                                 statements: preset?.statements ?? [],
//                                 isPublic: false,
//                                 isRunning: false,
//                             } as Strategy
//                         }
//                         onFormDataUpdate={handleFormDataupdate}
//                     />
//                     {/* <div className="flex flex-col gap-3">
//             <div className="flex flex-col lg:flex-row gap-3 lg:min-h-[70vh] lg:max-h-[70vh] overflow-hidden">
//               <div className="w-full lg:w-1/2 min-h-[50vh] max-h-[50vh] border flex flex-col border-border rounded-lg lg:min-h-full lg:max-h-full overflow-hidden ">
//                 <div className="max-h-full overflow-y-auto flex-1  p-3 flex flex-col gap-3 ">
//                   {aiAssistantChatData.map((chat) => {
//                     return (
//                       <div key={chat.id} className="flex gap-3">
//                         <div className="w-8 h-8 min-w-8 min-h-8 overflow-hidden flex items-center justify-center bg-neutral-900 p-2 rounded-md">
//                           {chat.type === 'ai' && (
//                             <Image
//                               src={`${chat.avatar}`}
//                               alt={`${chat.name} avatar`}
//                               width={100}
//                               height={100}
//                               className=""
//                             />
//                           )}
//                           {chat.type === 'user' && (
//                             <FaUser className=" text-primary text-sm" />
//                           )}
//                         </div>

//                         <div className="flex flex-col gap-1">
//                           <div className="text-base font-semibold leading-4">
//                             {chat.name}
//                           </div>
//                           <div className=" text-neutral-text">
//                             {chat.content}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//                 <div className="border-t border-border p-3 relative z-10 bg-neutral-950">
//                   <div className="h-6 w-full relative ">
//                     <input
//                       placeholder="Type a message..."
//                       className="w-full h-full pr-9 bg-transparent text-neutral-text leading-6 outline-none text-base md:text-sm"
//                     />
//                     <div className="w-7 h-7 right-0 rounded-md bg-neutral-900 absolute bottom-1/2 translate-y-1/2 flex items-center justify-center text-neutral-text-dark hover:bg-neutral-800 hover:text-neutral-text  apply-transition p-2">
//                       <FaPaperPlane />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="w-full lg:w-1/2 min-h-[50vh] max-h-[50vh] border border-border rounded-lg p-3 lg:min-h-full lg:max-h-full overflow-y-auto ">
//                 <StrategyForm
//                   initialName={preset?.name}
//                   initialDescription={preset?.description}
//                   initialStatements={preset?.statements}
//                   onFormDataUpdate={handleFormDataupdate}
//                 />
//               </div>
//             </div>
//             <div className="border border-border rounded-lg lg:min-h-[60vh] lg:max-h-[60vh] flex flex-col ">
//               <div className="flex items-center justify-between p-3">
//                 <div className="text-base font-bold">Simulate</div>
//                 <div>
//                   <button
//                     type="button"
//                     className="flex bg-table-odd rounded-lg px-4 h-10  min-h-10 items-center justify-center hover:bg-neutral-900  apply-transition text-neutral-text border border-border uppercase text-xs font-semibold min-w-fit gap-1"
//                   >
//                     Simulate
//                   </button>
//                 </div>
//               </div>

//               <div className="flex-1 flex flex-col lg:flex-row w-full gap-3 overflow-hidden px-3 pb-3">
//                 <div className=" w-full lg:w-1/2 border border-border rounded-lg overflow-hidden lg:min-h-full lg:max-h-full min-h-[50vh] max-h-[50vh]">
//                   <div className="py-3 px-3 border-b border-border">Output</div>
//                   <div className="p-3 max-h-full overflow-y-auto">Output</div>
//                 </div>
//                 <div className=" w-full lg:w-1/2 border border-border rounded-lg overflow-hidden lg:min-h-full lg:max-h-full min-h-[50vh] max-h-[50vh]">
//                   <div className="py-3 px-3 border-b border-border">
//                     JSON Object
//                   </div>
//                   <div className="p-3 max-h-full overflow-y-auto">
//                     <pre className=" break-words whitespace-break-spaces">
//                       {JSON.stringify(formData, null, 2)}
//                     </pre>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div> */}
//                 </div>
//             </div>
//         )
//     }

//     return null // Optionally handle loading state with a loading indicator here
// }

// const ATSCreatePage = () => {
//     return (
//         <Suspense>
//             <CreatePage />
//         </Suspense>
//     )
// }

// export default ATSCreatePage
