import axiosLib from '@/lib/axios';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';

const getUserTokenHoldingsAnalytic = async (
  chain: string,
  walletAddress: string,
): Promise<UserHoldingsAnalytic> => {
  if (!walletAddress) {
    throw new Error('Wallet address is required');
  }
  const res = await axiosLib.get(
    `/api/${chain}/user/holdings/analytic?walletAddress=${walletAddress}`,
  );

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useUserTokenHoldingsAnalyticData = (
  chain: string,
  walletAddress: string,
) => {
  const { authenticated, user } = usePrivy();

  return useQuery({
    queryKey: ['userTokenHoldingsAnalytic', user?.id, chain],
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    enabled: Boolean(authenticated && walletAddress && !!walletAddress),
    queryFn: async () =>
      await getUserTokenHoldingsAnalytic(chain, walletAddress),
  });
};

export default useUserTokenHoldingsAnalyticData;
