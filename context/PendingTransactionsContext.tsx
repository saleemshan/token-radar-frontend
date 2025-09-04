'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface PendingTransaction {
    id: string
    token: {
        address: string
        symbol: string
        logo?: string
        name?: string
    }
    chain: ChainId
    estimatedBalance: number | string
    estimatedValue: number | string
    estimatedProfitLoss: number | string
    estimatedProfitLossPercentage: number | string
    status: 'pending' | 'completed' | 'failed'
    createdAt: number
}

interface PendingTransactionsContextProps {
    pendingTransactions: PendingTransaction[]
    addPendingTransaction: (transaction: Omit<PendingTransaction, 'id' | 'createdAt'>) => void
    updateTransactionStatus: (id: string, status: 'completed' | 'failed') => void
    clearPendingTransactions: () => void
}

const PendingTransactionsContext = createContext<PendingTransactionsContextProps | undefined>(undefined)

export const PendingTransactionsProvider = ({ children }: { children: ReactNode }) => {
    const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([
        // {
        //     id: '1',
        //     token: {
        //         address: '0xa123123',
        //         symbol: 'USDC',
        //         logo: 'https://www.google.com',
        //         name: 'asdsad',
        //     },
        //     chain: 'solana',
        //     estimatedBalance: 122222,
        //     estimatedValue: 3333,
        //     estimatedProfitLoss: 12234,
        //     estimatedProfitLossPercentage: 2334,
        //     status: 'pending',
        //     createdAt: 123,
        // },
    ])

    // Add a new pending transaction
    const addPendingTransaction = (transaction: Omit<PendingTransaction, 'id' | 'createdAt'>) => {
        const newTransaction = {
            ...transaction,
            id: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: Date.now(),
            status: 'pending' as const,
        }

        setPendingTransactions(prev => [...prev, newTransaction])
    }

    // Update transaction status
    const updateTransactionStatus = (id: string, status: 'completed' | 'failed') => {
        setPendingTransactions(prev => prev.map(tx => (tx.id === id ? { ...tx, status } : tx)))
    }

    // Clear all pending transactions
    const clearPendingTransactions = () => {
        setPendingTransactions([])
    }

    // Auto-remove completed/failed transactions after 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now()
            setPendingTransactions(prev => prev.filter(tx => tx.status === 'pending' || now - tx.createdAt < 30000))
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <PendingTransactionsContext.Provider
            value={{
                pendingTransactions,
                addPendingTransaction,
                updateTransactionStatus,
                clearPendingTransactions,
            }}
        >
            {children}
        </PendingTransactionsContext.Provider>
    )
}

export const usePendingTransactions = () => {
    const context = useContext(PendingTransactionsContext)
    if (!context) {
        throw new Error('usePendingTransactions must be used within a PendingTransactionsProvider')
    }
    return context
}
