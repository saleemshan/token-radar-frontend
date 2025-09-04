import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenSecurity = async (
  chain: string,
  address?: string,
): Promise<TokenSecurity> => {
  if (!address) {
    throw new Error('Token address is required');
  }
  const res = await axios.get(`/api/${chain}/tokens/${address}/security`);

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }
  return res.data.data;
};

const useTokenSecurityData = (chain: string, address?: string) => {
  return useQuery({
    queryKey: ['tokenSecurityData', address],
    queryFn: async () => await getTokenSecurity(chain, address),
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
};

export default useTokenSecurityData;
