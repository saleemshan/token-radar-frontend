// import { usePrivy } from '@privy-io/react-auth';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import axios from 'axios';

// const withdrawToken = async (params: UserWithdraw) => {
//   const response = await axios.post(
//     `/api/${params.chain}/user/balances/withdraw`,
//     params,
//     {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     },
//   );

//   return response.data;
// };

// export const useMutateWithdrawTokenData = () => {
//   const queryClient = useQueryClient();
//   const { user } = usePrivy();
//   return useMutation({
//     mutationFn: withdrawToken,
//     onSuccess: (data, params) => {
//       queryClient.refetchQueries({
//         queryKey: ['userTokenBalance', params.fromAsset, , user?.id],
//       });
//       queryClient.refetchQueries({
//         queryKey: ['userBalances', user?.id, params.chain],
//       });
//       queryClient.refetchQueries({
//         queryKey: ['userBalancesActivities', user?.id, params.chain],
//       });
//     },
//   });
// };
