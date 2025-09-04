import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const getData = async (
  token: string,
  chain: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{
  availability: boolean;
  status: 'OK' | 'KO';
}> => {
  const res = await axios.get(`/api/bubblemaps/availability`, {
    params: {
      token,
      chain,
    },
  });

  const data = await res.data;

  //status ok = available
  //status ko = not available

  // console.log({ data });

  if (data.status === 'OK') {
    return data;
  } else {
    throw new Error('No data found');
  }
};

const useBubblemapsAvailabilityData = (token: string, chain: string) => {
  return useQuery({
    queryKey: ['tokenBubbleMapsAvailability', token, chain],
    queryFn: async () => await getData(token, chain),
    enabled: !!(token && chain),
  });
};

export default useBubblemapsAvailabilityData;
