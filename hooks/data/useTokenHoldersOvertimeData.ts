import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenHoldersOvertime = async (
  chain: string,
  address: string,
): Promise<TokenHoldersOvertime> => {
  const res = await axios.get(
    `/api/${chain}/tokens/${address}/holders/overtime`,
  );

  if (!res.data) {
    throw new Error('No data found');
  }

  return res.data;
};

const useTokenHoldersOvertimeData = (chain: string, address: string) => {
  return useQuery({
    queryKey: ['tokenHoldersOvertime', address],
    enabled: Boolean(address),
    queryFn: async () => await getTokenHoldersOvertime(chain, address),
    refetchOnMount: false,
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

export default useTokenHoldersOvertimeData;
