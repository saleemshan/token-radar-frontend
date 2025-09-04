import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTrendingNewPairTokens = async (
  chain: string,
  interval: TrendingTokensInterval,
): Promise<Token[]> => {
  const res = await axios.get(`/api/${chain}/tokens/trending/new-pair`, {
    params: {
      interval,
    },
  });

  if (!res.data.data || res.data.data.length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useTrendingNewPairTokensData = (
  chain: string,
  interval: TrendingTokensInterval,
) => {
  return useQuery({
    queryKey: ['trendingNewPairTokensData', chain, interval],
    queryFn: async () => await getTrendingNewPairTokens(chain, interval),
    refetchInterval: 20000,
    //   retry: false,
    //   refetchOnWindowFocus: false,
  });
};

export default useTrendingNewPairTokensData;
