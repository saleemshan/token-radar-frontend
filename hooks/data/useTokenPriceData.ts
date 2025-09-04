import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenPrice = async (
  chain: string,
  address?: string,
): Promise<TokenPrice> => {
  if (!address) {
    throw new Error('Token address is required');
  }
  const res = await axios.get(`/api/${chain}/tokens/${address}/price`);

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }
  return res.data.data;
};

const useTokenPriceData = (chain: string, address?: string) => {
  return useQuery({
    queryKey: ['tokenPriceData', address],
    queryFn: async () => await getTokenPrice(chain, address),
    enabled: Boolean(chain && address),
    refetchInterval: 60000,
  });
};

export default useTokenPriceData;
