import axiosLib from '@/lib/axios';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';

const getUserPublicWalletAddress = async (chain: string): Promise<string> => {
  const res = await axiosLib.get(`/api/${chain}/user/public-wallet-address`);

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useUserPublicWalletAddressData = (chain: string) => {
  const { ready, authenticated, user } = usePrivy();
  return useQuery({
    queryKey: ['userPublicWalletAddress', user?.id, chain],
    queryFn: async () => await getUserPublicWalletAddress(chain),
    enabled: Boolean(ready && authenticated && user),
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

// export const useMutateUserPublicWalletAddressData = () => {
//   const queryClient = useQueryClient();
//   const { user } = usePrivy();
//   return useMutation({
//     mutationFn: getUserPublicWalletAddress,
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ['userPublicWalletAddress', user?.id],
//       });
//     },
//   });
// };

export default useUserPublicWalletAddressData;
