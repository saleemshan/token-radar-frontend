import { useQuery } from '@tanstack/react-query';

const useTokenDetailedStats = (
  chain: string,
  pairAddress: string | undefined,
  quoteToken: 'token0' | 'token1',
) => {
  return useQuery<TokenDetailedStats, Error>({
    queryKey: ['tokenDetailedStats', chain, pairAddress, quoteToken],
    queryFn: async () => {
      if (!pairAddress) throw new Error('Pair address is required');

      const response = await fetch(
        `/api/${chain}/detailed-stats/${pairAddress}?quote_token=${quoteToken}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch detailed stats');
      }

      const data = await response.json();

      return data?.data?.getDetailedStats;
    },
    enabled: !!pairAddress && !!chain,
  });
};

export default useTokenDetailedStats;
