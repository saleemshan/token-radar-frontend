import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenDevInfoData = async (
  chain: string,
  address: string,
): Promise<TokenDevInfo> => {
  const res = await axios.get(
    `/api/${chain}/tokens/${address}/insiders/dev-info`,
  );

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useTokenDevInfoData = (chain: string, address: string) => {
  return useQuery({
    queryKey: ['tokenDevInfo', address, chain],
    queryFn: async () => await getTokenDevInfoData(chain, address),
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
  });
};

export default useTokenDevInfoData;
