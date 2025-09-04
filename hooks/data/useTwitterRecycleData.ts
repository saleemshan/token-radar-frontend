import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenTwitterRecycle = async (
  twitterId?: string,
): Promise<string[]> => {
  if (!twitterId) {
    throw new Error('Token address is required');
  }
  const res = await axios.get(`/api/twitter-recycle`, {
    params: {
      twitter_id: twitterId,
    },
  });

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }
  return res.data.data.messages;
};

const useTokenTwitterRecycleData = (twitterId?: string) => {
  return useQuery({
    queryKey: ['tokenTwitterRecycleData', twitterId],
    queryFn: async () => await getTokenTwitterRecycle(twitterId),
    enabled: !!twitterId,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
};

export default useTokenTwitterRecycleData;
