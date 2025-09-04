/* eslint-disable @typescript-eslint/no-unused-vars */
import { useUser } from '@/context/UserContext'
// import { activities } from '@/data/dummy/activity';
import { getSlicedAddress } from '@/utils/crypto'
import { getReadableNumber } from '@/utils/price'
import { getUppercaseFirstLetter } from '@/utils/string'
import { getTimeComparison } from '@/utils/time'
import Link from 'next/link'
import React from 'react'
import { SiSolana } from 'react-icons/si'

const ActivityTab = () => {
    const { chain } = useUser()
    return (
        <div className=" min-h-[60vh] max-h-[60vh] overflow-x-auto">
            <table className=" table-auto w-full h-full">
                <thead className="w-fullsticky -top-[3px] md:top-0 uppercase bg-black text-sm z-20">
                    <tr className="w-full text-neutral-text-dark relative">
                        <th className="py-3 text-xs px-4">
                            Time
                            <div className="h-[1px] w-full bg-border absolute inset-x-0 bottom-0"></div>
                        </th>
                        <th className="py-3 text-xs px-4">Type</th>
                        <th className="py-3 text-xs px-4">Total USD</th>
                        <th className="py-3 text-xs px-4">Amount</th>
                        <th className="py-3 text-xs px-4">Price</th>
                        <th className="py-3 text-xs px-4">Maker</th>
                        <th className="py-3 text-xs px-4">Action</th>
                    </tr>
                </thead>
                <tbody className="w-full text-xs">
                    {/* {activities.map((activity, index) => {
            return (
              <tr
                key={index}
                className="hover:bg-table-odd bg-table-even cursor-pointer border-b border-border/80 apply-transition relative"
              >
                <td className="text-center  py-3">
                  {getTimeComparison(activity.executed_at)}
                  <div
                    className={`absolute inset-y-0 left-0  w-1 ${
                      activity.type === 'buy' ? 'bg-positive' : 'bg-negative'
                    }`}
                  ></div>
                </td>
                <td
                  className={` text-center ${
                    activity.type === 'buy' ? 'text-positive' : 'text-negative'
                  }`}
                >
                  {getUppercaseFirstLetter(activity.type)}
                </td>
                <td className="text-center  ">
                  {getReadableNumber(activity.total_usd, undefined, '$')}
                </td>
                <td className="text-center  ">{activity.amount}</td>
                <td className="text-center  ">
                  {getReadableNumber(activity.price_usd, undefined, '$')}
                </td>
                <td className="text-center  ">
                  {getSlicedAddress(activity.maker)}
                </td>
                <td className="">
                  <div className="flex items-center justify-center">
                    <Link href={`${chain.explorer.tx}/123`}>
                      <SiSolana className="text-xs" />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })} */}
                </tbody>
            </table>
        </div>
    )
}

export default ActivityTab
