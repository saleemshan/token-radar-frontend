import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const getSearchTokensData = async (
  chain: string,
  query: string,
): Promise<Token[]> => {
  const res = await axios.get(`/api/${chain}/tokens/search?query=${query}`);

  if (!res.data.data || res.data.data.length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useSearchTokensData = (chain: string, query: string) => {
  return useQuery({
    queryKey: ['searchTokensData'],
    queryFn: async () => await getSearchTokensData(chain, query),
  });
};

export const useMutateSearchTokensData = (chain: string, query: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => await getSearchTokensData(chain, query),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['searchTokensData'] });
    },
  });
};

export default useSearchTokensData;
