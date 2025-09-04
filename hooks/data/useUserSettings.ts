import axiosLib from '@/lib/axios';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useUserSettings = () => {
  const { authenticated } = usePrivy();

  return useQuery({
    queryKey: ['user-settings'],
    enabled: Boolean(authenticated),
    queryFn: async () => {
      const res = await axiosLib.get('/api/user-settings');
      return res.data.data;
    },
  });
};

export const useMutateUserSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      selected_token_address: string;
      selected_token_chain: string;
    }) => {
      const response = await axiosLib.post('/api/user-settings', params);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};
