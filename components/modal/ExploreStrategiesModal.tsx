// 'use client'
// import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'

// import Modal, { ModalMethods } from './Modal'
// import { FaXmark } from 'react-icons/fa6'
// import Tag from '../Tag'
// // import { presetAts } from '@/data/default/ats'
// import StrategyModal from './StrategyModal'

// const ExploreStrategiesModal = forwardRef(({ handleOpenCreateModal }: { handleOpenCreateModal: () => void }, ref) => {
//     const modalRef = React.createRef<ModalMethods>()

//     const [selectedStrategy, setSelectedStrategy] = useState<undefined | PresetStrategy>(undefined)

//     // const [presetStrategies] = useState([...presetAts])
//     const [presetStrategies] = useState([])

//     const addTriggerModal = useRef<{
//         toggleModal: (targetIndex?: number) => void
//     }>(null)

//     const handleToggleModal = useCallback(() => {
//         modalRef.current?.toggleModal()
//     }, [modalRef])

//     useImperativeHandle(ref, () => ({
//         toggleModal: handleToggleModal,
//     }))

//     return (
//         <>
//             <Modal ref={modalRef}>
//                 <div className="max-w-6xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full ">
//                     <div className="p-3 flex border-b border-border items-center bg-black">
//                         <div className=" text-base   font-semibold leading-6 text-white flex-1 ">{`Explore Strategies`}</div>
//                         <div>
//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     modalRef.current?.closeModal()
//                                 }}
//                                 className="flex  bg-table-odd border border-border hover:bg-neutral-900 rounded-lg w-8 h-8 items-center justify-center text-neutral-text apply-transition "
//                             >
//                                 <FaXmark />
//                             </button>
//                         </div>
//                     </div>

//                     <div className="flex flex-col p-3 pb-3 max-h-[70vh] overflow-y-auto gap-4">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                             {presetStrategies &&
//                                 presetStrategies.length > 0 &&
//                                 presetStrategies.map((agent, index) => {
//                                     return (
//                                         <button
//                                             disabled={!agent.enabled}
//                                             type="button"
//                                             onClick={() => {
//                                                 setSelectedStrategy(agent)
//                                                 addTriggerModal.current?.toggleModal()
//                                             }}
//                                             key={index}
//                                             className="border overflow-hidden border-border rounded-lg flex flex-col gap-1 relative p-3 min-h-[100px] md:min-h-[160px] bg-table-odd hover:bg-neutral-900 apply-transition"
//                                         >
//                                             <div className="flex items-center gap-1">
//                                                 <div className="text-sm text-left">{agent.name}</div>
//                                                 {agent.isPopular && <Tag>POPULAR🔥</Tag>}
//                                             </div>
//                                             <div className="text-xs text-neutral-text-dark max-h-12 overflow-ellipsis text-left whitespace-normal">
//                                                 {agent.description}
//                                             </div>

//                                             <div className="flex items-center mt-auto gap-3 justify-end w-full">
//                                                 <div className="text-neutral-text-dark text-xs leading-none">by Crush</div>
//                                             </div>
//                                             {!agent.enabled && (
//                                                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                                                     <span className=" rotate-[-8deg] font-black text-7xl text-white/5 uppercase">Coming Soon</span>
//                                                 </div>
//                                             )}
//                                         </button>
//                                     )
//                                 })}
//                         </div>
//                     </div>
//                 </div>
//             </Modal>

//             <StrategyModal
//                 strategy={selectedStrategy}
//                 ref={addTriggerModal}
//                 onStrategyCreate={() => {
//                     addTriggerModal.current?.toggleModal()
//                     handleToggleModal()

//                     //open create modal
//                     handleOpenCreateModal()
//                 }}
//             ></StrategyModal>
//         </>
//     )
// })

// ExploreStrategiesModal.displayName = 'ExploreStrategiesModal'

// export default ExploreStrategiesModal
