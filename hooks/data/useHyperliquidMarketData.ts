import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getData = async (): Promise<any> => {
  const res = await axios.get('/api/hyperliquid/market-data');

  if (!res.data.data) {
    throw new Error('No role data found');
  }

  console.log('res.data.data', res.data.data);

  return res.data.data;
};

export const useHyperliquidMarketData = () => {
  return useQuery({
    queryKey: ['hyperliquid-market-data'],
    queryFn: () => getData(),
    refetchInterval: 120000,
  });
};
