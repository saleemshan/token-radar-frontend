import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getAlphaFeedMarqueeData = async (
  chain: string,
): Promise<AlphaFeedMarquee> => {
  const res = await axios.get(
    `/api/${chain}/alpha-feed/marquee?limit=50&minutes=5000`,
  );

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useAlphaFeedMarqueeData = (chain: string) => {
  return useQuery({
    queryKey: ['alphaFeedMarqueeData'],
    queryFn: async () => await getAlphaFeedMarqueeData(chain),
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

export default useAlphaFeedMarqueeData;
