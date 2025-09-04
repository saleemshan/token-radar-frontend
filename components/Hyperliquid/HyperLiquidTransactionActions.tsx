'use client'

import React, { useRef } from 'react'

import WithdrawModal, { WithdrawModalMethods } from '../modal/WithdrawModal'
import Button from '../ui/Button'
import HyperliquidExchangeModal, { HyperliquidExchangeModalMethods } from '../modal/HyperliquidExchangeModal'

const HyperLiquidTransactionActions = () => {
    const depositModalRef = useRef<HyperliquidExchangeModalMethods>(null)
    const withdrawModalRef = useRef<WithdrawModalMethods>(null)

    const handleOpenWithdrawModal = () => {
        withdrawModalRef.current?.toggleModal()
    }

    const handleWithdrawSuccess = () => {
        console.log('USDC withdrawal successful')
        // Add success notification or other actions
    }

    const handleWithdrawError = (error: string) => {
        console.error('USDC withdrawal error:', error)
        // Add error notification or other actions
    }

    const handleOpenDepositModal = () => {
        depositModalRef.current?.toggleModal()
    }

    return (
        <div className="grid grid-cols-2 gap-2 p-2 relative pointer-events-auto">
            <Button onClick={handleOpenDepositModal} className="w-full text-xs">
                Deposit USDC
            </Button>
            <Button onClick={handleOpenWithdrawModal} className="w-full text-xs">
                Withdraw USDC
            </Button>

            <WithdrawModal ref={withdrawModalRef} onSuccess={handleWithdrawSuccess} onError={handleWithdrawError} />

            <HyperliquidExchangeModal ref={depositModalRef} />
        </div>
    )
}

export default HyperLiquidTransactionActions
