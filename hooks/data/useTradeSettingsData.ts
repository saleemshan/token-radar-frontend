import axiosLib from '@/lib/axios';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const getTradeSettings = async (
  chain: string,
): Promise<TradeSettings> => {
  const res = await axiosLib.get(`/api/${chain}/trade/settings`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

export const useTradeSettingsData = (chain: string) => {
  const { ready, authenticated, user } = usePrivy();
  return useQuery({
    queryKey: ['tradeSettingsData', user?.id, chain],
    queryFn: async () => await getTradeSettings(chain),
    enabled: Boolean(ready && authenticated && user),
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

const updateTradeSettings = async (params: TradeSettings) => {
  const response = await axiosLib.post(
    `/api/${params.chain}/trade/settings`,
    params,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

export const useMutateTradeSettingsData = () => {
  const queryClient = useQueryClient();
  const { user } = usePrivy();
  return useMutation({
    mutationFn: (params: TradeSettings) => updateTradeSettings(params),
    onSuccess: (data, params) => {
      queryClient.invalidateQueries({
        queryKey: ['tradeSettingsData', user?.id, params.chain],
      });
    },
  });
};
