import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getData = async (
  symbol: string,
  timeFrame: string,
): Promise<LunarCrushChart> => {
  const res = await axios.get(`/api/lunar-crush/charts`, {
    params: {
      symbol: symbol,
      timeFrame,
    },
  });

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useTokenSocialData = (symbol: string, timeFrame: string = 'day') => {
  return useQuery({
    queryKey: ['tokenSocialData', symbol, timeFrame],
    queryFn: async () => await getData(symbol, timeFrame),
    enabled: !!symbol,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export default useTokenSocialData;
