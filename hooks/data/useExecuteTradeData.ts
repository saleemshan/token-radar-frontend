import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const executeTrade = async (params: ExecuteTrade) => {
  const response = await axios.post(`/api/${params.chain}/trade`, params, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

export const useMutateExecuteTradeData = () => {
  const queryClient = useQueryClient();
  const { user } = usePrivy();
  const mutation = useMutation({
    mutationFn: executeTrade,
    onSuccess: (data, params) => {
      queryClient.refetchQueries({
        queryKey: ['userTokenBalance', params.tokenAddress, user?.id],
      });
      queryClient.refetchQueries({
        queryKey: ['userTokenBalance', params.chainAddress, user?.id],
      });
      queryClient.refetchQueries({
        queryKey: ['tokenMyPositionsData', params.tokenAddress, user?.id],
      });
      queryClient.refetchQueries({
        queryKey: ['userBalances', user?.id, params.chain],
      });
      queryClient.refetchQueries({
        queryKey: ['userBalancesActivities', user?.id, params.chain],
      });
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const executeTradeSafely = async (params: any) => {
    console.log('checking if trade is already in progress');

    if (mutation.isPending) {
      console.warn('There is already a trade being executed, please wait.');
      return Promise.reject(new Error('A trade is already in progress'));
    }

    console.log('executing');

    return mutation.mutateAsync(params);
  };

  return {
    mutate: executeTradeSafely,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    data: mutation.data,
    error: mutation.error,
  };
};
