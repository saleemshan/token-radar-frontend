import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getTokenMyPositions = async (
  chain: string,
  address: string,
  publicWalletAddress?: string,
): Promise<TokenMyPositions> => {
  if (!publicWalletAddress) {
    throw new Error('Wallet address is required');
  }
  const res = await axios.get(
    `/api/${chain}/tokens/${address}/my-positions?public_wallet_address=${publicWalletAddress}`,
  );

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data;
};

const useTokenMyPositionsData = (
  chain: string,
  address: string,
  publicWalletAddress?: string,
) => {
  const { authenticated, user } = usePrivy();

  return useQuery({
    queryKey: ['tokenMyPositionsData', address, user?.id],
    enabled: Boolean(
      authenticated &&
        address &&
        publicWalletAddress &&
        !!address &&
        !!publicWalletAddress,
    ),
    queryFn: async () =>
      await getTokenMyPositions(chain, address, publicWalletAddress),
    refetchOnMount: false,
    refetchOnWindowFocus: true,
  });
};

export default useTokenMyPositionsData;
