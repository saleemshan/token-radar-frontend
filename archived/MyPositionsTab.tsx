// import { countDecimalPlaces, getReadableNumber } from '@/utils/price';
// import { getUppercaseFirstLetter } from '@/utils/string';
// import { getTimeComparison } from '@/utils/time';
// import Link from 'next/link';
// import React from 'react';
// import PercentageChange from '../PercentageChange';
// import { SiEthereum, SiSolana } from 'react-icons/si';
// import useTokenMyPositionsData from '@/hooks/data/useTokenMyPositionsData';
// import { useUser } from '@/context/UserContext';
// import TextLoading from '../TextLoading';
// import TableRowLoading from '../TableRowLoading';
// import { useLogin, usePrivy } from '@privy-io/react-auth';

// const MyPositionsTab = ({ tokenAddress }: { tokenAddress: string }) => {
//   const { chain, userPublicWalletAddresses } = useUser();
//   const { ready, authenticated } = usePrivy();
//   const { login: handleSignIn } = useLogin();

//   const { data, isLoading } = useTokenMyPositionsData(
//     chain.api,
//     tokenAddress,
//     userPublicWalletAddresses[chain.api],
//   );

//   // useEffect(() => {
//   //   refetch();
//   // }, [data, ready, authenticated, refetch, refresh]);

//   return (
//     <div className="flex flex-col min-h-[60vh] max-h-[60vh] relative">
//       {ready && authenticated ? (
//         <>
//           {/* analytics  */}
//           <div className="">
//             <div className="grid grid-cols-3 lg:grid-cols-6  py-2">
//               <div className="flex flex-col justify-center items-center p-2">
//                 <div className=" text-neutral-text-dark text-xs ">
//                   Balance (USD)
//                 </div>
//                 <div className="flex flex-col items-center justify-center h-10">
//                   {isLoading ? (
//                     <TextLoading />
//                   ) : (
//                     <div className=" text-sm text-neutral-text ">
//                       {getReadableNumber(
//                         data?.analytics?.balance_usd,
//                         2,
//                         '$',
//                         true,
//                       )}
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="flex flex-col justify-center items-center p-2">
//                 <div className=" text-neutral-text-dark text-xs ">
//                   Unrealized
//                 </div>
//                 <div className="flex flex-col items-center justify-center h-10">
//                   {isLoading ? (
//                     <TextLoading />
//                   ) : (
//                     <>
//                       <div
//                         className={`text-sm ${
//                           data?.analytics?.unrealized_pnl_usd
//                             ? data?.analytics?.unrealized_pnl_usd > 0
//                               ? 'text-positive'
//                               : data?.analytics?.unrealized_pnl_usd < 0
//                               ? 'text-negative'
//                               : 'text-neutral-text'
//                             : 'text-neutral-text'
//                         }`}
//                       >
//                         {getReadableNumber(
//                           data?.analytics?.unrealized_pnl_usd,
//                           2,
//                           '$',
//                           true,
//                         )}
//                       </div>

//                       <PercentageChange
//                         padding=""
//                         size="small"
//                         percentage={
//                           data?.analytics?.unrealized_pnl_percentage ?? 0
//                         }
//                       />
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className="flex flex-col justify-center items-center p-2">
//                 <div className=" text-neutral-text-dark text-xs ">Realized</div>
//                 <div className="flex flex-col items-center justify-center h-10">
//                   {isLoading ? (
//                     <TextLoading />
//                   ) : (
//                     <>
//                       <div
//                         className={`text-sm ${
//                           data?.analytics?.realized_pnl_usd
//                             ? data?.analytics?.realized_pnl_usd > 0
//                               ? 'text-positive'
//                               : data?.analytics?.realized_pnl_usd < 0
//                               ? 'text-negative'
//                               : 'text-neutral-text'
//                             : 'text-neutral-text'
//                         }`}
//                       >
//                         {getReadableNumber(
//                           data?.analytics?.realized_pnl_usd,
//                           2,
//                           '$',
//                           true,
//                         )}
//                       </div>

//                       <PercentageChange
//                         padding=""
//                         size="small"
//                         percentage={
//                           data?.analytics?.realized_pnl_percentage ?? 0
//                         }
//                       />
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className="flex flex-col justify-center items-center p-2">
//                 <div className=" text-neutral-text-dark text-xs ">
//                   Bought/Average
//                 </div>
//                 <div className="flex flex-col items-center justify-center h-10">
//                   {isLoading ? (
//                     <TextLoading />
//                   ) : (
//                     <>
//                       <div className=" text-sm text-neutral-text">
//                         {getReadableNumber(
//                           data?.analytics?.bought_usd,
//                           undefined,
//                           '$',
//                         )}
//                       </div>
//                       <div className="text-xs">
//                         {getReadableNumber(
//                           data?.analytics?.bought_average_price,
//                           countDecimalPlaces(
//                             data?.analytics?.bought_average_price ?? 0,
//                             2,
//                             2,
//                           ),
//                           '$',
//                         )}
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className="flex flex-col justify-center items-center p-2">
//                 <div className=" text-neutral-text-dark text-xs ">
//                   Sold/Average
//                 </div>
//                 <div className="flex flex-col items-center justify-center h-10">
//                   {isLoading ? (
//                     <TextLoading />
//                   ) : (
//                     <>
//                       <div className=" text-sm text-neutral-text">
//                         {getReadableNumber(data?.analytics?.sold_usd, 2, '$')}
//                       </div>
//                       <div className="text-xs">
//                         {getReadableNumber(
//                           data?.analytics?.sold_average_price,
//                           countDecimalPlaces(
//                             data?.analytics?.sold_average_price ?? 0,
//                             2,
//                             2,
//                           ),
//                           '$',
//                         )}
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//               <div className="flex flex-col justify-center items-center p-2">
//                 <div className=" text-neutral-text-dark text-xs ">
//                   Total Profit
//                 </div>
//                 <div className="flex flex-col items-center justify-center h-10">
//                   {isLoading ? (
//                     <TextLoading />
//                   ) : (
//                     <>
//                       <div
//                         className={`text-sm ${
//                           data?.analytics?.total_profit_usd
//                             ? data?.analytics?.total_profit_usd > 0
//                               ? 'text-positive'
//                               : data?.analytics?.total_profit_usd < 0
//                               ? 'text-negative'
//                               : 'text-neutral-text'
//                             : 'text-neutral-text'
//                         }`}
//                       >
//                         {getReadableNumber(
//                           data?.analytics?.total_profit_usd,
//                           2,
//                           '$',
//                           true,
//                         )}
//                       </div>

//                       <PercentageChange
//                         padding=""
//                         size="small"
//                         percentage={
//                           data?.analytics?.total_profit_percentage ?? 0
//                         }
//                       />
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* positions  */}
//           <div className="  overflow-x-auto mobile-no-scrollbar overflow-y-auto h-full border-t border-border">
//             <table className=" table-auto w-full h-full ">
//               <thead className="w-full sticky top-0 uppercase bg-black text-sm z-20">
//                 <tr className="w-full text-neutral-text-dark relative">
//                   <th className="py-3 text-xs px-4 text-nowrap">
//                     Time{' '}
//                     <div className="h-[1px] w-full bg-border absolute inset-x-0 bottom-0"></div>
//                   </th>
//                   <th className="py-3 text-xs px-4 text-nowrap">Type</th>
//                   <th className="py-3 text-xs px-4 text-nowrap">Total USD</th>
//                   <th className="py-3 text-xs px-4 text-nowrap">Amount</th>
//                   <th className="py-3 text-xs px-4 text-nowrap">Price</th>
//                   {/* <th className="py-3 text-xs px-4 text-nowrap">Maker</th> */}
//                   <th className="py-3 text-xs px-4 text-nowrap">Txn</th>
//                 </tr>
//               </thead>
//               {isLoading ? (
//                 <TableRowLoading
//                   totalTableData={6}
//                   totalRow={15}
//                   className="px-2"
//                 />
//               ) : (
//                 <tbody className="w-full text-xs">
//                   {data &&
//                     data.transactions.length > 0 &&
//                     data.transactions.map((transaction, index) => {
//                       return (
//                         <tr
//                           key={index}
//                           className="hover:bg-table-odd bg-table-even cursor-pointer border-b border-border/80 apply-transition relative"
//                         >
//                           <td className="text-center   relative py-3">
//                             {getTimeComparison(transaction.executed_at)}
//                             <div
//                               className={`absolute inset-y-0 left-0  w-1 ${
//                                 transaction.type === 'buy'
//                                   ? 'bg-positive'
//                                   : 'bg-negative'
//                               }`}
//                             ></div>
//                           </td>
//                           <td
//                             className={` text-center ${
//                               transaction.type === 'buy'
//                                 ? 'text-positive'
//                                 : 'text-negative'
//                             }`}
//                           >
//                             {getUppercaseFirstLetter(transaction.type)}
//                           </td>
//                           <td className="text-center  ">
//                             {getReadableNumber(transaction.total_usd, 2, '$')}
//                           </td>
//                           <td className="text-center  ">
//                             {' '}
//                             {getReadableNumber(transaction.amount, 3)}
//                           </td>
//                           <td className="text-center  ">
//                             {getReadableNumber(
//                               +transaction.price_usd,
//                               countDecimalPlaces(transaction.price_usd, 2, 2),
//                               '$',
//                             )}
//                           </td>
//                           {/* <td className="text-center  ">
//                             {getSlicedAddress(transaction.maker, 3, '-')}
//                           </td> */}
//                           <td className="">
//                             <div className="flex items-center justify-center">
//                               <Link
//                                 target="_blank"
//                                 href={`${chain.explorer.tx}/${transaction.transaction_hash}`}
//                               >
//                                 {chain.id === 'solana' && (
//                                   <SiSolana className="text-xs" />
//                                 )}
//                                 {chain.id === 'ethereum' && (
//                                   <SiEthereum className="text-xs" />
//                                 )}
//                               </Link>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                 </tbody>
//               )}
//             </table>
//           </div>
//         </>
//       ) : (
//         <div className="flex h-full gap-1 justify-center items-center text-center bg-black/50 absolute inset-0 backdrop-blur-sm z-50">
//           <button type="button" onClick={handleSignIn} className=" underline ">
//             Sign in
//           </button>
//           <span>{`to see your position`}</span>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyPositionsTab;
