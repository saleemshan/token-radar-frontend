import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getRelayCurrencies = async (
  chainId: number,
  defaultList: boolean = true,
  limit: number = 20,
  depositAddressOnly: boolean = false,
) => {
  const response = await axios.get('/api/relay/currencies', {
    params: {
      chainIds: chainId,
      defaultList,
      limit,
      depositAddressOnly,
    },
  });

  return response.data.data?.flat() ?? [];
};

const useRelayCurrencies = (chainId?: number) => {
  return useQuery({
    queryKey: ['relayCurrencies', chainId],
    queryFn: () => getRelayCurrencies(chainId!),
    enabled: !!chainId,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export default useRelayCurrencies;