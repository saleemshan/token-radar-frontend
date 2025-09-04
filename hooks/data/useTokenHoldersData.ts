import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenHolders = async (
  chain: string,
  address: string,
): Promise<TokenHolders> => {
  const res = await axios.get(`/api/${chain}/tokens/${address}/holders`);

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useTokenHoldersData = (chain: string, address: string) => {
  return useQuery({
    queryKey: ['tokenHoldersData', address, chain],
    queryFn: async () => await getTokenHolders(chain, address),
    enabled: !!address,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export default useTokenHoldersData;
