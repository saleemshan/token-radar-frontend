import { getReadableNumber } from '@/utils/price'
import React from 'react'

const StatementText = ({ statement }: { statement: Statement }) => {
    const getReadableOperator = (operator: Operator) => {
        let text = ''
        switch (operator) {
            case '=':
                text = 'is equal to'
                break

            case '>':
                text = 'is greater than'
                break

            case '<':
                text = 'is less than'
                break

            case '>=':
                text = 'is greater than or equal to'
                break

            case '<=':
                text = 'is less than or equal to'
                break

            default:
                text = operator
                break
        }
        return text
    }

    const getReadableStatmentType = (type: IfType | TriggerType | FilterType | ActionType) => {
        let text = ''
        switch (type) {
            case 'exchangeListing':
                text = 'exchange listing'
                break

            case 'kolMentions':
                text = 'KOL mentions'
                break

            case 'alphaGroupCalls':
                text = 'Alpha Group Calls'
                break

            case 'keywords':
                text = 'Keywords'
                break

            case 'marketCap':
                text = 'Market Cap'
                break

            case 'sentimentDirection':
                text = 'Sentiment'
                break

            case 'sentimentMomentum':
                text = 'Impact'
                break

            case 'leverage':
                text = 'Leverage'
                break

            case 'trade':
                text = 'Trade'
                break

            default:
                text = type
                break
        }
        return text
    }

    if (statement.type === 'exchangeListing') {
        return (
            <>
                <div className="text-xs font-bold">Listing on {statement.value}</div>
            </>
        )
    }

    if (statement.type === 'trade') {
        return (
            <>
                <div
                    className={`text-xs font-bold ${statement.value === 'buy' ? 'text-positive' : ''} ${
                        statement.value === 'sell' ? 'text-negative' : ''
                    }`}
                >
                    {statement.value}
                </div>

                <div className="text-xs font-bold ">{statement.amount ? getReadableNumber(+statement.amount, undefined, '$') : statement.amount}</div>
            </>
        )
    }

    if (statement.type === 'kolMentions') {
        return (
            <>
                <div className="text-xs font-bold">@{statement.value}</div>

                <div className="text-xs font-bold">Mention Token on Twitter</div>
            </>
        )
    }

    // if (statement.type === 'newsTrading') {
    //     return (
    //         <>
    //             <div className="text-xs font-bold">{statement.value}</div>
    //             <div className="text-xs font-bold">NEWS</div>
    //         </>
    //     )
    // }

    // if (statement.type === 'sentiment') {
    //     return (
    //         <>
    //             <div className="text-xs font-bold">Sentiment</div>
    //             <div className="text-2xs italic ">{getReadableOperator(statement.operator)}</div>
    //             <div
    //                 className={`text-xs font-bold ${statement.value === 'positive' ? 'text-positive' : ''} ${
    //                     statement.value === 'negative' ? 'text-negative' : ''
    //                 }`}
    //             >
    //                 {statement.value}
    //             </div>
    //         </>
    //     )
    // }

    return (
        <>
            <div className="text-xs font-bold">{getReadableStatmentType(statement.type)}</div>
            <div className="text-2xs italic ">{getReadableOperator(statement.operator)}</div>
            <div className="text-xs font-bold">
                {statement.type === 'marketCap' ? getReadableNumber(+statement.value, undefined, '$') : statement.value}
            </div>
        </>
    )
}
export default StatementText
