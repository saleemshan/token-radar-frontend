'use client'
import React, { forwardRef, useCallback, useImperativeHandle } from 'react'
import Modal, { ModalMethods } from './Modal'
import Image from 'next/image'

const ReferralRewardModal = forwardRef((props: { isKol: boolean }, ref) => {
    const modalRef = React.createRef<ModalMethods>()

    const handleToggleModal = useCallback(() => {
        modalRef.current?.toggleModal()
    }, [modalRef])

    useImperativeHandle(ref, () => ({
        toggleModal: handleToggleModal,
    }))

    return (
        <Modal ref={modalRef}>
            <div className="max-w-3xl bg-black border border-border rounded-lg overflow-hidden flex flex-col w-full p-4 max-h-[70vh] overflow-y-auto">
                <div className="text-white text-lg md:text-2xl font-bold leading-6 px-4 pt-4 pb-6 text-center">
                    Earn commission on all your referrals trading volume
                </div>

                <div className="flex flex-col ">
                    <Image
                        src={`/images/referral/${props.isKol ? 'kol' : 'non-kol'}.jpg`}
                        alt="KOL Reward"
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ width: '100%', height: 'auto' }}
                        className=" select-none"
                    />
                </div>

                <div className="flex flex-col md:flex-row w-full pt-6 gap-6 items-center">
                    {/* <div className="flex flex-col w-full ">
                        <div className="text-white text-lg md:text-2xl font-bold leading-6 pb-2">Special Bonus Program</div>
                        <div className=" text-xs md:text-sm">
                            10% bonus if trading volume is more than 1000 USDT instead of inviting a new invitee.
                        </div>
                    </div> */}
                    <div className=" flex flex-col w-full mx-auto border border-border rounded-lg divide-y divide-border overflow-hidden">
                        <div className="flex items-center w-full justify-between divide-x divide-border">
                            <div className=" w-1/2 text-center p-2 font-semibold bg-primary/30">Points</div>
                            <div className=" w-1/2 text-center p-2 font-semibold bg-primary/30">Bonus</div>
                        </div>
                        <div className="flex items-center w-full justify-between divide-x divide-border text-xs md:text-sm">
                            <div className=" w-1/2 text-center p-2">Lvl 1</div>
                            <div className=" w-1/2 text-center p-2">+5%</div>
                        </div>
                        <div className="flex items-center w-full justify-between divide-x divide-border text-xs md:text-sm">
                            <div className=" w-1/2 text-center p-2">Lvl 2</div>
                            <div className=" w-1/2 text-center p-2">+10%</div>
                        </div>
                        <div className="flex items-center w-full justify-between divide-x divide-border text-xs md:text-sm">
                            <div className=" w-1/2 text-center p-2">Lvl 3</div>
                            <div className=" w-1/2 text-center p-2">+15%</div>
                        </div>
                        <div className="flex items-center w-full justify-between divide-x divide-border text-xs md:text-sm">
                            <div className=" w-1/2 text-center p-2">Lvl 4</div>
                            <div className=" w-1/2 text-center p-2">+20%</div>
                        </div>
                        <div className="flex items-center w-full justify-between divide-x divide-border text-xs md:text-sm">
                            <div className=" w-1/2 text-center p-2">Lvl 5</div>
                            <div className=" w-1/2 text-center p-2">+25%</div>
                        </div>
                        <div className="flex items-center w-full justify-between divide-x divide-border text-xs md:text-sm">
                            <div className=" w-1/2 text-center p-2">Lvl 6</div>
                            <div className=" w-1/2 text-center p-2">+30%</div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
})

ReferralRewardModal.displayName = 'ReferralRewardModal'

export default ReferralRewardModal
