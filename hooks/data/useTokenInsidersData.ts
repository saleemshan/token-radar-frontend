import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenInsiders = async (
  chain: string,
  address: string,
): Promise<TokenInsiders> => {
  const res = await axios.get(`/api/${chain}/tokens/${address}/insiders`);

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useTokenInsidersData = (chain: string, address: string) => {
  return useQuery({
    queryKey: ['tokenInsidersData', address],
    queryFn: async () => await getTokenInsiders(chain, address),
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

export default useTokenInsidersData;
