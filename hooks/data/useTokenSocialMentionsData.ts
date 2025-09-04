import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenSocialMentions = async (
  chain: string,
  address: string,
): Promise<TokenHoldersOvertime> => {
  const res = await axios.get(
    `/api/${chain}/tokens/${address}/social-mentions`,
  );

  if (!res.data) {
    throw new Error('No data found');
  }

  return res.data;
};

const useTokenSocialMentionsData = (chain: string, address: string) => {
  return useQuery({
    queryKey: ['tokenSocialMentions', address],
    enabled: Boolean(address),
    queryFn: async () => await getTokenSocialMentions(chain, address),
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

export default useTokenSocialMentionsData;
