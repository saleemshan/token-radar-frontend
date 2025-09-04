import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenHoldersNoteworthy = async (
  chain: string,
  address: string,
): Promise<TokenHoldersNoteworthy> => {
  const res = await axios.get(
    `/api/${chain}/tokens/${address}/holders/noteworthy`,
  );

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  // console.log(res.data);

  return res.data.data.data;
};

const useTokenHoldersNoteworthyData = (chain: string, address: string) => {
  return useQuery({
    queryKey: ['tokenHoldersNoteworthyData', address, chain],
    queryFn: async () => await getTokenHoldersNoteworthy(chain, address),
    enabled: !!address,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

export default useTokenHoldersNoteworthyData;
