import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export type UserRole = 'missing' | 'user' | 'agent' | 'vault' | 'subAccount';

interface UserRoleResponse {
  code: number;
  data: {
    role: UserRole;
  };
}

const getUserRole = async (userAddress: string): Promise<UserRole> => {
  if (!userAddress || !/^0x[0-9a-fA-F]{40}$/.test(userAddress)) {
    throw new Error('Invalid user address format');
  }

  const res = await axios.post<UserRoleResponse>('/api/hyperliquid/user-role', {
    user: userAddress,
  });

  if (!res.data.data || !res.data.data.role) {
    throw new Error('No role data found');
  }

  return res.data.data.role;
};

export const useHyperliquidUserRoleData = (userAddress: string) => {
  return useQuery({
    queryKey: ['hyperliquid-user-role', userAddress],
    queryFn: () => getUserRole(userAddress),
    enabled: !!userAddress && /^0x[0-9a-fA-F]{40}$/.test(userAddress),
    retry: 2,
  });
};
