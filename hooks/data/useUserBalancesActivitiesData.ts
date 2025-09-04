import axiosLib from '@/lib/axios';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';

const getUserBalancesActivities = async (
  chain: string,
): Promise<WalletActivities> => {
  const res = await axiosLib.get(`/api/${chain}/user/balances/activities`);

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useUserBalancesActivitiesData = (chain: string) => {
  const { ready, authenticated, user } = usePrivy();
  return useQuery({
    queryKey: ['userWalletActivities', user?.id, chain],
    queryFn: async () => await getUserBalancesActivities(chain),
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    enabled: Boolean(ready && authenticated && user),
  });
};

// export const useMutateUserBalancesActivitiesData = (chain: ChainId) => {
//   const queryClient = useQueryClient();
//   const { user } = usePrivy();
//   return useMutation({
//     mutationFn: getUserBalancesActivities,
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ['userWalletActivities', user?.id, chain],
//       });

//       queryClient.refetchQueries({
//         predicate: (query) => {
//           return query.queryKey.some(
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//             (key: any) =>
//               typeof key === 'string' && key.includes('userWalletActivities'),
//           );
//         },
//       });
//     },
//   });
// };

export default useUserBalancesActivitiesData;
