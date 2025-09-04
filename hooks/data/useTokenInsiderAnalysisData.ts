import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getData = async (
  chain: string,
  address: string,
): Promise<NewTokenInsider> => {
  try {
    const res = await axios.get(
      `/api/${chain}/tokens/${address}/insider-analysis`,
    );

    if (!res.data.data || Object.keys(res.data.data).length === 0) {
      throw new Error('No data found');
    }

    return res.data.data;
  } catch (error) {
    throw error;
  }
};

const useTokenInsidersData = (chain: string, address: string) => {
  return useQuery({
    queryKey: ['tokenInsiderAnalysisData', address],
    queryFn: async () => await getData(chain, address),
    enabled: !!address,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

export default useTokenInsidersData;
