import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTopInfluencers = async (
  symbol: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<TopInfluencer[]> => {
  const res = await axios.get(`/api/lunar-crush/influencers`, {
    params: {
      symbol: symbol,
    },
  });

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useTokenTopInfluencersData = (symbol: string) => {
  return useQuery({
    queryKey: ['tokenTopInfluencersData', symbol],
    queryFn: async () => await getTopInfluencers(symbol),
    enabled: !!symbol,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export default useTokenTopInfluencersData;
