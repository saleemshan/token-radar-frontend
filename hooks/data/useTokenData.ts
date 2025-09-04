import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getToken = async (chain?: string, address?: string): Promise<Token> => {
  if (!chain || !address) {
    throw new Error('Invalid parameters');
  }

  const res = await axios.get(`/api/${chain}/tokens/${address}`);

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }
  return res.data.data;
};

const useTokenData = (chain?: string, address?: string) => {
  return useQuery({
    queryKey: ['tokenData', address],
    queryFn: async () => await getToken(chain, address),
    enabled: Boolean(chain) && Boolean(address),
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    // refetchOnWindowFocus: false,
  });
};

export default useTokenData;
