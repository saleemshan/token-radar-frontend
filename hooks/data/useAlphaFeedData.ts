import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getAlphaFeedData = async (
  chain: string,
  address?: string,
): Promise<AlphaFeed> => {
  let url = `/api/${chain}/alpha-feed`;

  if (address) {
    url = `${url}?filter=${address}`;
  }

  const res = await axios.get(url);

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useAlphaFeedData = (chain: string, address?: string) => {
  return useQuery({
    queryKey: ['alphaFeedData'],
    queryFn: async () => await getAlphaFeedData(chain, address),
    refetchInterval: 20000,
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

export default useAlphaFeedData;
