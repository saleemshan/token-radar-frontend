import axiosLib from '@/lib/axios';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';

const getUserTokenHoldings = async (
  chain: string,
  walletAddress: string,
): Promise<UserTokenHoldings> => {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }
  const res = await axiosLib.get(
    `/api/${chain}/user/holdings?walletAddress=${walletAddress}`,
  );

  if (res.data.message !== 'success') {
    throw new Error('No data found');
  }

  // console.log('refetch token holdings', res.data.data);

  return res.data.data;
};

const useUserTokenHoldingsData = (chain: string, walletAddress: string) => {
  const { authenticated, user } = usePrivy();

  return useQuery({
    queryKey: ['userTokenHoldings', user?.id, chain],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: Boolean(authenticated && walletAddress && user && user.id),
    queryFn: async () => await getUserTokenHoldings(chain, walletAddress),
  });
};

export default useUserTokenHoldingsData;
