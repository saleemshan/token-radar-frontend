import axiosLib from '@/lib/axios';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';

const getUserBalances = async (
  chain: string,

  cached: boolean,
): Promise<UserBalance[]> => {
  const res = await axiosLib.get(`/api/${chain}/user/balances`, {
    params: {
      cached,
    },
  });

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useUserBalancesData = (chain: string, cached: boolean) => {
  const { ready, authenticated, user } = usePrivy();
  return useQuery({
    queryKey: ['userWalletBalances', user?.id, chain],
    queryFn: async () => await getUserBalances(chain, cached),
    // refetchOnWindowFocus: true,
    enabled: Boolean(ready && authenticated && user),
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });
};

export default useUserBalancesData;
