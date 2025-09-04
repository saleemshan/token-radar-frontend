import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getMarketIntelligence = async (
  chain: string,
  address?: string,
): Promise<TokenMarketIntelligence> => {
  if (!address) {
    throw new Error('Token address is required');
  }
  const res = await axios.get(
    `/api/${chain}/tokens/${address}/market-intelligence`,
  );

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useTokenMarketIntelligenceData = (chain: string, address?: string) => {
  return useQuery({
    queryKey: ['tokenMarketIntelligenceData', address],
    queryFn: async () => await getMarketIntelligence(chain, address),
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    // retry: false,
  });
};

export default useTokenMarketIntelligenceData;
