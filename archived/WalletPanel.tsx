// import { useUser } from '@/context/UserContext';
// import { useLogin, useLogout, usePrivy } from '@privy-io/react-auth';
// import React, { useEffect, useState } from 'react';
// import { FaArrowsRotate, FaChevronRight } from 'react-icons/fa6';
// import CopyToClipboard from './CopyToClipboard';
// import useUserBalancesData, {
//   useMutateUserBalancesData,
// } from '@/hooks/data/useUserBalancesData';
// import Image from 'next/image';
// import Link from 'next/link';
// import { getReadableNumber } from '@/utils/price';
// import { useQueryClient } from '@tanstack/react-query';
// import TextLoading from './TextLoading';
// import { formatDateForWalletActivity } from '@/utils/time';
// import {
//   calculateBalance,
//   filterWalletActivities,
//   filterWalletBalances,
//   getActivityName,
//   getActivitySymbol,
//   getTextColor,
// } from '@/utils/wallet';
// import WithdrawForm from './forms/WithdrawForm';
// import useIsMobile from '@/hooks/useIsMobile';
// import useUserBalancesActivitiesData from '@/hooks/data/useUserBalancesActivitiesData';
// import { TOKEN_PLACEHOLDER_IMAGE } from '@/utils/image';
// import PrimaryButton from './PrimaryButton';
// import { useRouter } from 'next/navigation';
// import { getTokenUrl } from '@/utils/url';
// import PercentageChange from './PercentageChange';
// import { chains } from '@/data/default/chains';

// const WalletPanel = ({
//   setShowWalletPanel,
// }: {
//   setShowWalletPanel: (show: boolean) => void;
// }) => {
//   const { logout: handleSignOut } = useLogout();
//   const isMobile = useIsMobile();
//   const { authenticated, ready, user } = usePrivy();

//   const {
//     userPublicWalletAddress,
//     setUserPublicWalletAddress,
//     chain,
//     setLastSelectedToken,
//   } = useUser();
//   const queryClient = useQueryClient();
//   const { login: handleSignIn } = useLogin();
//   const { data: userBalancesData, isLoading: isUserBalancesDataLoading } =
//     useUserBalancesData(chain.api);

//   const { mutate: mutateUserBalances, isPending: isMutateUserBalancesPending } =
//     useMutateUserBalancesData(chain.api);

//   const {
//     data: userBalancesActivitiesData,
//     isLoading: isUserBalancesActivitiesLoading,
//   } = useUserBalancesActivitiesData(chain.api);

//   const {
//     mutate: mutateUserBalancesActivities,
//     isPending: isMutateUserBalancesActivitiesPending,
//   } = useMutateUserBalancesData(chain.api);

//   const mainCurrencyChainAddresses = chains.map((chain) => chain.address);

//   const [activeTab, setActiveTab] = useState<'Balances' | 'Activities'>(
//     'Balances',
//   );
//   const router = useRouter();
//   const [showWithdrawForm, setShowWithdrawForm] = useState(false);

//   const [userBalances, setUserBalances] = useState<
//     | { balanceChange24hPercentage: number | undefined; balanceUSD: number }
//     | undefined
//   >(undefined);

//   useEffect(() => {
//     if (userBalancesData) setUserBalances(calculateBalance(userBalancesData));
//   }, [userBalancesData]);

//   // const [lastUserId, setLastUserId] = useState<string | undefined>(undefined);

//   const tabs: ('Balances' | 'Activities')[] = ['Balances', 'Activities'];

//   const handleRefresh = () => {
//     if (isUserBalancesActivitiesLoading || isUserBalancesDataLoading) return;

//     if (activeTab === 'Balances') return mutateUserBalances(chain.api);

//     if (activeTab === 'Activities')
//       return mutateUserBalancesActivities(chain.api);
//   };

//   const handleLogoutClick = () => {
//     if (user?.id) {
//       queryClient.removeQueries({
//         predicate: (query) => {
//           return query.queryKey.some(
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             (key: any) => typeof key === 'string' && key.includes(user.id),
//           );
//         },
//       });
//     }
//     setUserPublicWalletAddress(undefined);
//     handleSignOut();
//     setShowWalletPanel(false);
//     router.push('/');
//   };

//   if (ready && authenticated) {
//     return (
//       <div
//         className={`  ${
//           isMobile
//             ? 'w-full flex-col h-full'
//             : 'fixed right-3 inset-y-3 rounded-lg  md:flex-row '
//         } z-[101] flex   overflow-hidden `}
//       >
//         {!isMobile && (
//           <button
//             type="button"
//             onClick={() => {
//               setShowWalletPanel(false);
//               setShowWithdrawForm(false);
//             }}
//             className=" w-14 h-full group bg-black hover:bg-table-odd apply-transition -mr-2 lg:hover:-mr-4  flex flex-col items-center justify-center border-border border overflow-hidden rounded-lg"
//           >
//             <FaChevronRight className="mr-2  lg:group-hover:mr-4 apply-transition group-hover:text-neutral-text text-neutral-text-dark" />
//           </button>
//         )}
//         <div
//           className={`flex flex-col h-full w-full md:w-80  bg-black overflow-hidden relative ${
//             isMobile ? '' : 'border border-border rounded-lg'
//           }`}
//         >
//           <div
//             className={`p-3 flex flex-col gap-3  border-border  ${
//               isMobile ? '' : 'border-b'
//             }`}
//           >
//             <div className="p-3  rounded-lg border-border glex flex-col bg-[#0f0f0f]">
//               <div className="flex items-center gap-1  pb-2">
//                 <div className=" w-[20px] h-[20px] min-w-[20px] min-h-[20px]  overflow-hidden rounded-full border border-border -bottom-[2px] -right-[6px] p-[1px] bg-black">
//                   <Image
//                     src={chain.logo}
//                     alt={`${chain.name} logo`}
//                     width={200}
//                     height={200}
//                     className="rounded-full"
//                   />
//                 </div>
//                 <div className=" font-semibold text-sm">
//                   Deposit Wallet Address
//                 </div>
//               </div>
//               <div className="flex gap-3 items-center bg-neutral-900 p-3  rounded-md">
//                 <div className=" break-all text-neutral-text">
//                   {userPublicWalletAddress ?? '-'}
//                 </div>
//                 {userPublicWalletAddress && (
//                   <CopyToClipboard
//                     content={userPublicWalletAddress}
//                     iconSize={14}
//                     className="text-neutral-text ml-auto"
//                   />
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 className="flex-1  bg-neutral-900 hover:bg-neutral-800 font-semibold text-neutral-text-dark apply-transition py-3 rounded-lg w-full text-sm hover:text-neutral-text"
//                 type="button"
//                 onClick={() => {
//                   setShowWithdrawForm(!showWithdrawForm);
//                 }}
//               >
//                 Withdraw
//               </button>
//               <button
//                 className="flex-1  bg-neutral-900 hover:bg-neutral-800 font-semibold text-neutral-text-dark apply-transition py-3 rounded-lg w-full text-sm hover:text-neutral-text"
//                 type="button"
//                 onClick={handleLogoutClick}
//               >
//                 Logout
//               </button>
//             </div>
//           </div>

//           {showWithdrawForm && (
//             <div className="border-b border-border p-3 absolute bg-black inset-0 z-[10]">
//               <WithdrawForm
//                 handleCancelWithdraw={() => {
//                   setShowWithdrawForm(false);
//                 }}
//               />
//             </div>
//           )}

//           <div className="h-full overflow-hidden flex flex-col">
//             <div
//               className={`flex flex-col  border-border p-3 gap-1 ${
//                 isMobile ? '' : 'border-b'
//               }`}
//             >
//               <div className="text-sm">Total Balance</div>
//               <div className="flex items-end text-white text-2xl">
//                 {isUserBalancesDataLoading || !userBalances ? (
//                   <TextLoading />
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <div className="flex gap-1 items-end">
//                       <div className="font-medium leading-none">
//                         {userBalances.balanceUSD.toFixed(2)}
//                       </div>
//                       <div className="text-sm mb-[1px] leading-none">USD</div>
//                     </div>

//                     {userBalances.balanceChange24hPercentage && (
//                       <PercentageChange
//                         percentage={userBalances.balanceChange24hPercentage}
//                         size="small"
//                         style={true}
//                         width="w-fit"
//                         padding="px-2 py-1"
//                       ></PercentageChange>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div
//               className={`flex p-3 gap-3 border-border ${
//                 isMobile ? '' : 'border-b'
//               }`}
//             >
//               {tabs.map((tab) => {
//                 return (
//                   <button
//                     key={tab}
//                     onClick={() => {
//                       setActiveTab(tab);
//                     }}
//                     className={` flex text-nowrap items-center justify-center text-xs py-1 hover:bg-neutral-800 duration-200 transition-all  px-2 rounded-md font-semibold ${
//                       activeTab === tab
//                         ? 'bg-neutral-800 text-neutral-text'
//                         : 'bg-neutral-900 text-neutral-text-dark'
//                     }`}
//                   >
//                     {tab}
//                   </button>
//                 );
//               })}

//               <button
//                 type="button"
//                 onClick={handleRefresh}
//                 className={`ml-auto flex hover:bg-neutral-800 bg-neutral-900 rounded-lg w-7 h-7 items-center justify-center text-neutral-text-dark hover:text-neutral-text/60 apply-transition`}
//               >
//                 <FaArrowsRotate
//                   className={` ${
//                     isMutateUserBalancesPending ||
//                     isMutateUserBalancesActivitiesPending
//                       ? 'animate-spin'
//                       : ''
//                   }`}
//                 />
//               </button>
//             </div>
//             {activeTab === 'Balances' && (
//               <div className="h-full overflow-y-auto flex flex-col  mb-[4.65rem] md:mb-0">
//                 {isUserBalancesDataLoading ? (
//                   <>
//                     {Array.from({ length: 10 }).map((_, index) => {
//                       return (
//                         <div
//                           key={index}
//                           className={`flex justify-between items-center gap-3 p-3  border-border/50 ${
//                             isMobile ? '' : 'border-b'
//                           }`}
//                         >
//                           <div className="flex items-center gap-3">
//                             <div className="bg-border animate-pulse min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-border overflow-hidden relative flex items-center justify-center "></div>
//                             <TextLoading />
//                           </div>

//                           <div className="flex flex-col  items-end max-w-full overflow-hidden">
//                             <div className="text-sm">
//                               <TextLoading />
//                             </div>
//                             <div className=" text-neutral-text-dark text-[12px] -mt-[2px]">
//                               <TextLoading />
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </>
//                 ) : (
//                   <>
//                     {userBalancesData &&
//                       userBalancesData.length > 0 &&
//                       filterWalletBalances(userBalancesData).map((balance) => {
//                         return (
//                           <Link
//                             onClick={() => {
//                               setShowWalletPanel(false);
//                               setLastSelectedToken({
//                                 address: balance.address,
//                                 chain: balance.chain,
//                               });
//                             }}
//                             key={balance.address}
//                             href={getTokenUrl(
//                               balance.chain ?? 'solana',
//                               balance.address,
//                               isMobile,
//                             )}
//                             className={`flex justify-between items-center gap-3 hover:bg-table-odd apply-transition p-3  border-border/50 ${
//                               isMobile ? '' : 'border-b'
//                             }    ${
//                               mainCurrencyChainAddresses.includes(
//                                 balance.address,
//                               )
//                                 ? ' pointer-events-none'
//                                 : ''
//                             }`}
//                           >
//                             <div className="flex items-center gap-3">
//                               <div className="bg-black min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-border overflow-hidden relative flex items-center justify-center ">
//                                 <Image
//                                   src={`${
//                                     balance.logo ?? TOKEN_PLACEHOLDER_IMAGE
//                                   }`}
//                                   alt={`${balance.name} logo`}
//                                   width={200}
//                                   height={200}
//                                   className="rounded-full"
//                                 />
//                               </div>
//                               <div className=" w-36 min-w-36 max-w-36 overflow-clip text-nowrap text-ellipsis  text-sm">
//                                 {mainCurrencyChainAddresses.includes(
//                                   balance.address,
//                                 )
//                                   ? balance.symbol?.toUpperCase()
//                                   : balance.symbol}
//                               </div>
//                             </div>

//                             <div className="flex flex-col  items-end max-w-full overflow-hidden">
//                               <div className="text-sm">
//                                 {getReadableNumber(balance.amount, 2)}{' '}
//                                 {mainCurrencyChainAddresses.includes(
//                                   balance.address,
//                                 )
//                                   ? balance.symbol?.toUpperCase()
//                                   : balance.symbol ?? '-'}
//                               </div>
//                               <div className=" text-neutral-text-dark text-[12px] -mt-[2px]">
//                                 {getReadableNumber(
//                                   balance.amount * balance.priceUSD,
//                                   2,
//                                   '$',
//                                 )}
//                               </div>
//                             </div>
//                           </Link>
//                         );
//                       })}
//                   </>
//                 )}
//               </div>
//             )}

//             {activeTab === 'Activities' && (
//               <div className="h-full overflow-y-auto flex flex-col  mb-[4.65rem] md:mb-0">
//                 {isUserBalancesActivitiesLoading ? (
//                   <>
//                     {Array.from({ length: 10 }).map((_, index) => {
//                       return (
//                         <div
//                           key={index}
//                           className={`flex justify-between items-center gap-3 p-3  border-border/50 ${
//                             isMobile ? '' : 'border-b'
//                           }`}
//                         >
//                           <div className="flex items-center gap-3">
//                             <div className="bg-border animate-pulse min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-border overflow-hidden relative flex items-center justify-center "></div>
//                             <TextLoading />
//                           </div>

//                           <div className="flex flex-col  items-end max-w-full overflow-hidden">
//                             <div className="text-sm">
//                               <TextLoading />
//                             </div>
//                             <div className=" text-neutral-text-dark text-[12px] -mt-[2px]">
//                               <TextLoading />
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </>
//                 ) : (
//                   <>
//                     {userBalancesActivitiesData &&
//                       userBalancesActivitiesData.length > 0 &&
//                       filterWalletActivities(userBalancesActivitiesData).map(
//                         (day) => {
//                           return (
//                             <div
//                               key={day.date}
//                               className={`flex flex-col border-border/50 ${
//                                 isMobile ? '' : 'border-b'
//                               }`}
//                             >
//                               <div className="p-3 ">
//                                 {formatDateForWalletActivity(day.date)}
//                               </div>
//                               {day.activities.map((activity, index) => {
//                                 if (
//                                   activity.amount * activity.priceUSD >
//                                   0.01
//                                 ) {
//                                   return (
//                                     <Link
//                                       onClick={() => {
//                                         setShowWalletPanel(false);
//                                       }}
//                                       target="_blank"
//                                       key={`${activity.transactionHash}-${index}`}
//                                       href={`${chain.explorer.tx}/${activity.transactionHash}`}
//                                       className="flex justify-between items-center gap-3 hover:bg-table-odd apply-transition p-3 "
//                                     >
//                                       <div className="flex items-center gap-3">
//                                         <div className="bg-black min-w-10 min-h-10 max-w-10 max-h-10 rounded-full border border-border overflow-hidden relative flex items-center justify-center ">
//                                           <Image
//                                             src={`${
//                                               activity.tokenLogo ??
//                                               TOKEN_PLACEHOLDER_IMAGE
//                                             }`}
//                                             alt={`${activity.tokenName} logo`}
//                                             width={200}
//                                             height={200}
//                                             className="rounded-full"
//                                           />
//                                         </div>
//                                         <div className=" w-36 min-w-36 max-w-36 overflow-clip text-nowrap text-ellipsis  text-sm">
//                                           {getActivityName(
//                                             activity.type,
//                                             activity.tokenSymbol,
//                                           )}
//                                         </div>
//                                       </div>

//                                       <div className="flex flex-col  items-end max-w-full overflow-hidden ">
//                                         <div
//                                           className={`text-sm w-full break-all text-right text-ellipsis ${getTextColor(
//                                             activity.type,
//                                           )}`}
//                                         >
//                                           {getActivitySymbol(activity.type)}{' '}
//                                           {getReadableNumber(
//                                             activity.amount,
//                                             2,
//                                           )}{' '}
//                                           {activity.tokenSymbol.toUpperCase()}
//                                         </div>
//                                         <div className=" text-neutral-text-dark text-[12px] -mt-[2px]">
//                                           {getReadableNumber(
//                                             activity.priceUSD,
//                                             2,
//                                             '$',
//                                           )}
//                                         </div>
//                                       </div>
//                                     </Link>
//                                   );
//                                 }
//                               })}
//                             </div>
//                           );
//                         },
//                       )}
//                   </>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     );
//   } else {
//     return (
//       <div className="flex w-full flex-col items-center justify-center p-3 flex-1 gap-3">
//         <div>Sign in to view your wallet</div>
//         <PrimaryButton className="" onClick={handleSignIn}>
//           Sign In
//         </PrimaryButton>
//       </div>
//     );
//   }
// };

// export default WalletPanel;
