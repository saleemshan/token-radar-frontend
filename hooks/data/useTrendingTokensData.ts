import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTrendingTokens = async (
  chain: string,
  interval: TrendingTokensInterval,
): Promise<Token[]> => {
  const res = await axios.get(`/api/${chain}/tokens/trending`, {
    params: {
      interval,
    },
  });

  if (!res.data.data || res.data.data.length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useTrendingTokensData = (
  chain: string,
  interval: TrendingTokensInterval,
) => {
  return useQuery({
    queryKey: ['trendingTokensData', chain, interval],
    queryFn: async () => await getTrendingTokens(chain, interval),
    refetchInterval: 20000,
    //   retry: false,
    //   refetchOnWindowFocus: false,
  });
};

export default useTrendingTokensData;
