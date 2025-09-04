import axiosLib from '@/lib/axios';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';

const getUserReferralCommission = async (): Promise<UserReferralCommission> => {
  const res = await axiosLib.get(`/api/user/referral/commission`);

  if (!res.data.data || Object.keys(res.data.data).length === 0) {
    throw new Error('No data found');
  }

  return res.data.data.data;
};

const useUserReferralCommission = () => {
  const { ready, authenticated, user } = usePrivy();
  return useQuery({
    queryKey: ['userReferralCommission', user?.id],
    queryFn: async () => await getUserReferralCommission(),
    enabled: Boolean(ready && authenticated && user),
  });
};

export default useUserReferralCommission;
