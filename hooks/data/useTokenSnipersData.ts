import { useQuery } from '@tanstack/react-query';

interface SniperInfo {
  status: 'hold' | 'bought_more' | 'sold_part' | 'sold' | 'transfered';
  wallet_address: string;
  tags: string[];
  maker_token_tags: string[];
}

interface StatusNow {
  hold: number;
  bought_more: number;
  sold_part: number;
  sold: number;
  transfered: number;
  bought_rate: string;
  holding_rate: string;
  top_10_holder_rate: number;
}

interface HoldersData {
  chain: string;
  holder_count: number;
  statusNow: StatusNow;
  sold_diff: number;
  sold_part_diff: number;
  hold_diff: number;
  bought_more: number;
  holderInfo: SniperInfo[];
}

interface ApiResponse {
  code: number;
  message: string;
  data: {
    holders: HoldersData;
  };
}

const useTokenSnipersData = (chain: string, tokenAddress: string) => {
  return useQuery({
    queryKey: ['token-snipers', chain, tokenAddress],
    queryFn: async () => {
      const response = await fetch(`/api/${chain}/sniper-info/${tokenAddress}`);
      if (!response.ok) {
        throw new Error('Failed to fetch token snipers data');
      }
      const data: ApiResponse = await response.json();
      return data.data.holders;
    },
    enabled: !!chain && !!tokenAddress,
  });
};

export default useTokenSnipersData;
