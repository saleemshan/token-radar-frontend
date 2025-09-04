import { chains } from '@/data/default/chains';

export const getMainChainAddress = (chainId: string) => {
  const selectedChain = chains.find((chain) => chain.id === chainId);

  if (!selectedChain) return undefined;

  return selectedChain.address;
};
