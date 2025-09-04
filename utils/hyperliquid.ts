import { AssetCtx, Cancel, CandleSnapshot, Meta, OrderRequest, OrderType, SubAccount } from '@/types/hyperliquid'
import { constants, providers, utils } from 'ethers'
import { signInner } from './signing'
import { timestamp } from './timestamp'

export enum Chain {
    ArbitrumTestnet = 'ArbitrumTestnet',
    Arbitrum = 'Arbitrum',
}

export enum ChainId {
    ArbitrumTestnet = 421614,
    Arbitrum = 42161,
}

export enum OrderStep {
    STEP_0_01 = 0.01,
    STEP_0_1 = 0.1,
    STEP_1 = 1,
    STEP_10 = 10,
    STEP_100 = 100,
    STEP_1000 = 1000,
}

export class Hyperliquid {
    private chain: Chain
    private base_url: string

    // ----------------- INITIALIZER -----------------
    constructor(base_url: string, chain = Chain.ArbitrumTestnet) {
        this.base_url = base_url
        this.chain = chain
    }
    // ----------------- PROTECTED -----------------
    private post = async (
        request: Record<string, unknown>
    ): Promise<{
        success: boolean
        data: Record<string, unknown> | SubAccount[] | null | string
        msg: string | null
    }> => {
        const endpoint = request.endpoint as string
        const url = `${this.base_url}/${endpoint}`
        // Remove endpoint from request body
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { endpoint: _, ...requestBody } = request
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(requestBody),
            credentials: 'include',
        }).then(res => res.json())
    }

    // ----------------- EXCHANGE => PLACE ORDER <= -----------------

    placeOrder = async (order: OrderRequest, vaultAdress: string | null = null) => {
        const orders = [order].reduce((acc: OrderRequest[], order) => {
            acc.push({
                asset: order.asset,
                isBuy: order.isBuy,
                limitPx: order.limitPx,
                sz: order.sz,
                reduceOnly: order.reduceOnly,
                orderType: order.orderType,
                ...(order?.cloid && { cloid: order.cloid }),
            })

            return acc
        }, [])

        const action = {
            grouping: 'na',
            orders,
        }

        const request = {
            endpoint: 'exchange',
            type: 'order',
            action,
            ...(vaultAdress && { vaultAdress }),
        }

        return this.post(request)
    }

    cancelOrder = async (cancels: Cancel[], vaultAdress: string | null = null) => {
        const action = {
            cancels,
        }

        const request = {
            endpoint: 'exchange',
            type: 'cancel',
            action,
            ...(vaultAdress && { vaultAdress }),
        }

        return this.post(request)
    }

    normalTpSl = async (normal: OrderRequest, tp?: OrderRequest, sl?: OrderRequest, vaultAdress: string | null = null) => {
        // if no tp and sl,throw an error
        if (!tp && !sl) {
            throw new Error('No tp and sl')
        }

        const orders = [normal, tp, sl].reduce((acc: OrderRequest[], order) => {
            if (order) {
                acc.push({
                    asset: order.asset,
                    isBuy: order.isBuy,
                    limitPx: order.limitPx.toString(),
                    reduceOnly: order.reduceOnly,
                    sz: order.sz.toString(),
                    orderType: order.orderType,
                    ...(order?.cloid && { cloid: order.cloid }),
                })
            }
            return acc
        }, [])

        const action = {
            grouping: 'normalTpsl',
            orders,
        }

        const request = {
            endpoint: 'exchange',
            type: 'order',
            action,
            ...(vaultAdress && { vaultAdress }),
        }

        return this.post(request)
    }

    scaleOrderDistribution = (
        sz: number | string,
        szDecimals: number,
        startPx: number,
        endPx: number,
        orderCount: number,
        skew: number = 1.0,
        extraArgs?: {
            asset: number
            isBuy: boolean
            reduceOnly: boolean
            orderType: OrderType
            cloid?: string | null
        }
    ) => {
        const totalSz = parseFloat(sz.toString())

        const baseSz = totalSz / ((orderCount * (1 + skew)) / 2)

        const endSz = baseSz * skew

        const remaining = orderCount - 1

        const sizeStep = (endSz - baseSz) / remaining

        const priceStep = (endPx - startPx) / remaining

        const orders = Array.from({ length: orderCount }, (_, i) => ({
            limitPx: parsePrice(startPx + priceStep * i),
            sz: parseSize(baseSz + sizeStep * i, szDecimals),
            ...extraArgs,
        }))

        return orders
    }

    updateLeverage = async (asset: number, isCross: boolean, leverage: number, vaultAdress: string | null = null) => {
        const action = {
            asset,
            isCross,
            leverage,
        }

        const request = {
            endpoint: 'exchange',
            type: 'updateLeverage',
            action,
            isFrontend: true,
            ...(vaultAdress && { vaultAdress }),
        }

        return this.post(request)
    }

    updateIsolatedMargin = async (asset: number, isBuy: boolean, ntli: number, vaultAdress: string | null = null) => {
        const action = {
            asset,
            isBuy,
            ntli: utils.parseUnits(ntli.toString(), 6).toNumber(),
        }

        const request = {
            endpoint: 'exchange',
            type: 'updateIsolatedMargin',
            action,
            ...(vaultAdress && { vaultAdress }),
        }

        return this.post(request)
    }

    // ----------------- EXCHANGE => TWAP <= -----------------
    placeTwapOrder = async (
        asset: number,
        isBuy: boolean,
        minutes: number,
        reduceOnly: boolean,
        sz: number | string,
        randomize: boolean,
        frequency: number = 30,
        vaultAdress: string | null = null
    ) => {
        const request = {
            endpoint: 'exchange',
            type: 'twapOrder',
            action: {
                asset,
                isBuy,
                runtime: minutes * 60, // minutes to seconds
                reduceOnly,
                sz: parseFloat(sz.toString()),
                randomize,
                frequency,
            },
            ...(vaultAdress && { vaultAdress }),
        }

        return this.post(request)
    }

    // ----------------- EXCHANGE => SUB ACCOUNTS <= -----------------

    createSubAccount = async (name: string, vaultAdress: string | null = null) => {
        const action = {
            name,
        }

        const request = {
            endpoint: 'exchange',
            type: 'createSubAccount',
            action,
            ...(vaultAdress && { vaultAdress }),
        }

        return this.post(request)
    }

    subAccountModify = async (name: string, subAccountUser: string, vaultAdress: string | null = null) => {
        const action = {
            subAccountUser,
            name,
        }

        const request = {
            endpoint: 'exchange',
            type: 'subAccountModify',
            action,
            ...(vaultAdress && { vaultAdress }),
        }

        return this.post(request)
    }

    subAccountTransfer = async (isDeposit: boolean, subAccountUser: string, usd: number | string, vaultAdress: string | null = null) => {
        const action = {
            subAccountUser,
            isDeposit,
            usd: utils.parseUnits(usd.toString(), 6).toNumber(),
        }

        const request = {
            endpoint: 'exchange',
            type: 'subAccountTransfer',
            action,
            ...(vaultAdress && { vaultAdress }),
        }

        return this.post(request)
    }

    connect = async (user: string) => {
        return this.post({
            endpoint: 'connect',
            user,
        })
    }

    connectAgent = async (signer: providers.JsonRpcSigner, agentAddress: string, agentName?: string, vaultAdress?: string) => {
        const nonce = timestamp()

        const hyperliquidChain = this.chain === Chain.Arbitrum ? 'Mainnet' : 'Testnet'

        agentName = (agentName || '').trim()

        const chainId = this.chain === Chain.Arbitrum ? ChainId.Arbitrum : ChainId.ArbitrumTestnet

        const action: {
            hyperliquidChain: string
            agentAddress: string
            nonce: number
            type: string
            signatureChainId: string
            agentName?: string
        } = {
            hyperliquidChain,
            agentAddress,
            nonce,
            type: 'approveAgent',
            signatureChainId: `0x${Number(chainId).toString(16)}`,
            agentName,
        }

        const domain = {
            chainId,
            name: 'HyperliquidSignTransaction',
            verifyingContract: constants.AddressZero,
            version: '1',
        }

        const types = {
            'HyperliquidTransaction:ApproveAgent': [
                { name: 'hyperliquidChain', type: 'string' },
                { name: 'agentAddress', type: 'address' },
                { name: 'agentName', type: 'string' },
                { name: 'nonce', type: 'uint64' },
            ],
        }

        const signature = await signInner(signer, domain, types, action)

        if (!agentName) delete action.agentName

        const request = {
            endpoint: 'exchange',
            type: 'approveAgent',
            action,
            nonce,
            signature,
            ...(vaultAdress && { vaultAdress }),
        }

        return this.post(request)
    }

    // ----------------- INFO => SUB ACCOUNTS <= -----------------

    subAccounts = async (user: string) => {
        const request = {
            endpoint: 'info',
            type: 'subAccounts',
            user,
        }

        return this.post(request)
    }

    historicalOrders = async (user: string) => {
        const request = {
            endpoint: 'info',
            type: 'historicalOrders',
            user,
        }

        return this.post(request)
    }

    userFees = async (user: string) => {
        const request = {
            endpoint: 'info',
            type: 'userFees',
            user,
        }

        return this.post(request)
    }

    spotMeta = async () => {
        const request = {
            endpoint: 'info',
            type: 'spotMeta',
        }

        return this.post(request)
    }

    candleSnapshot = async (req: CandleSnapshot) => {
        const request = {
            endpoint: 'info',
            type: 'candleSnapshot',
            req,
        }

        return this.post(request)
    }

    metaAndAssetCtxs = async (meta: Meta, assetCtxs: AssetCtx[]) => {
        return meta.universe.map((universe, assetId) => ({
            assetId,
            universe,
            assetCtx: assetCtxs[assetId] ?? null,
        }))
    }
}

export const parsePrice = (px: number) => {
    const pxFormatted = px.toFixed(6)

    let pxAdjusted: string
    if (pxFormatted.startsWith('0.')) {
        pxAdjusted = pxFormatted
    } else {
        const pxSplit = pxFormatted.split('.')
        const whole = pxSplit[0]
        const decimals = pxSplit[1]

        const diff = 5 - whole.length // 0
        const sep = diff > 0 ? '.' : ''

        pxAdjusted = sep === '' ? `${whole}` : toFixed(`${whole}${sep}${decimals}`, diff)
    }

    const pxCleaned = removeTrailingZeros(pxAdjusted)

    return positive(pxCleaned)
}

/**
 * @param n number toFixed
 * @param fixed number of decimals
 * @returns string
 * @description
 *
 * @example
 * toFixed(1.2345, 2) => '1.23'
 * toFixed(1.2345, 4) => '1.2345'
 * toFixed(1.2345, 5) => '1.23450'
 *
 * @source https://quickref.me/truncate-a-number-to-a-given-number-of-decimal-places-without-rounding.html
 */
export const toFixed = (n: number | string, fixed: number) => `${n}`.match(new RegExp(`^-?\\d+(?:\.\\d{0,${fixed}})?`))![0]

export const parseSize = (sz: number | string, szDecimals: number) => {
    const px = removeTrailingZeros(toFixed(sz, szDecimals))

    return positive(px)
}

const removeTrailingZeros = (s: string) => {
    let result = s
    while (result.endsWith('0') && result.includes('.')) {
        result = result.slice(0, -1)
    }
    if (result.endsWith('.')) {
        result = result.slice(0, -1)
    }
    return result
}

const positive = (value: string) => {
    return value.startsWith('-') ? '0' : value
}
