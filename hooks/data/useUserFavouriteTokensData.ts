import axiosLib from '@/lib/axios';
import { usePrivy } from '@privy-io/react-auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const getUserFavouriteTokens = async (
  chain: string,
): Promise<FavouriteToken[]> => {
  // console.log(chain);

  // const res = await axiosLib.get(`/api/solana/user/favourite-tokens`);
  const res = await axiosLib.get(`/api/${chain}/user/favourite-tokens`);

  // if (!res.data.data || Object.keys(res.data.data).length === 0) {
  //   throw new Error('No data found');
  // }

  return res.data.data;
};

const useUserFavouriteTokensData = (chain: string) => {
  const { ready, authenticated, user } = usePrivy();
  return useQuery({
    queryKey: ['userFavouriteTokens', user?.id],
    queryFn: async () => await getUserFavouriteTokens(chain),
    enabled: Boolean(ready && authenticated && user),
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    // retry: false,
    // refetchOnWindowFocus: false,
  });
};

const updateUserFavouriteTokens = async (params: {
  chain: string;
  tokenAddress: string;
  favourite: boolean;
  logo: string;
  name: string;
  symbol: string;
}) => {
  const response = await axiosLib.post(
    // `/api/solana/user/favourite-tokens`,
    `/api/${params.chain}/user/favourite-tokens`,
    params,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

export const useMutateUserFavouriteTokensData = () => {
  const queryClient = useQueryClient();
  const { user } = usePrivy();
  return useMutation({
    mutationFn: (params: {
      chain: string;
      tokenAddress: string;
      favourite: boolean;
      logo: string;
      name: string;
      symbol: string;
    }) => updateUserFavouriteTokens(params),

    onSuccess: () => {
      // const favourite = params.favourite;

      // const favouriteToken = {
      //   address: params.tokenAddress,
      //   logo: params.logo,
      //   name: params.name,
      //   symbol: params.symbol,
      // };

      // queryClient.setQueryData(
      //   ['userFavouriteTokens', user?.id],
      //   (oldArray: FavouriteToken[]) => {
      //     if (favourite) {
      //       return [...oldArray, favouriteToken];
      //     } else {
      //       return oldArray.filter(
      //         (token) => token.address !== favouriteToken.address,
      //       );
      //     }
      //   },
      // );

      queryClient.refetchQueries({
        queryKey: ['userFavouriteTokens', user?.id],
      });
    },
  });
};

export default useUserFavouriteTokensData;
