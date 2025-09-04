import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenLiquidity = async (
  chain: string,
  address: string,
): Promise<TokenLiquidity> => {
  const res = await axios.get(`/api/${chain}/tokens/${address}/liquidity`);

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useTokenLiquidityData = (chain: string, address: string) => {
  return useQuery({
    queryKey: ['tokenLiquidity', address, chain],
    queryFn: async () => await getTokenLiquidity(chain, address),
    enabled: !!address,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

export default useTokenLiquidityData;
