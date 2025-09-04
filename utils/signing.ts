import {
  TypedDataDomain,
  TypedDataField,
  Wallet,
  constants,
  providers,
  utils,
} from 'ethers';
import { serialize as packb } from '@ygoe/msgpack';

export enum Chain {
  Arbitrum = 'arbitrum',
  ArbitrumTestnet = 'arbitrum-testnet',
}

export const actionHash = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: Record<string, any>,
  vaultAddress: string | null,
  nonce: number
): string => {
  const data_binary = packb(action);
  let encoded = Buffer.from(data_binary).toString('hex');
  encoded += nonce.toString(16).padStart(16, '0');
  encoded += vaultAddress ? `01${vaultAddress}` : `00`;

  const decoded = new Uint8Array(Buffer.from(encoded, 'hex'));
  return utils.keccak256(decoded);
};

export const constructPhantomAgent = (
  connectionId: string,
  isMainnet: boolean
): Record<string, string> => {
  return { source: isMainnet ? 'a' : 'b', connectionId };
};

export const signInner = async (
  signer: providers.JsonRpcSigner | Wallet,
  domain: TypedDataDomain,
  types: Record<string, TypedDataField[]>,
  value: Record<string, unknown>
): Promise<{ r: string; s: string; v: number }> => {
  try {
    const signature = await signer._signTypedData(domain, types, value);
    const { r, s, v } = utils.splitSignature(signature);
    return { r, s, v };
  } catch (error) {
    console.error('Error signing typed data:', error);
    throw new Error('Failed to sign typed data');
  }
};

export const signL1Action = async (
  signer: Wallet,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: Record<string, any>,
  nonce: number,
  chain: string = Chain.ArbitrumTestnet,
  vaultAddress: string | null = null
): Promise<{ r: string; s: string; v: number }> => {
  const hash = actionHash(action, vaultAddress, nonce);
  const isMainnet = chain === Chain.Arbitrum;
  const phantomAgent = constructPhantomAgent(hash, isMainnet);

  const domain = {
    chainId: isMainnet ? 42161 : 421613,
    name: 'Exchange',
    verifyingContract: constants.AddressZero,
    version: '1',
  };

  const types = {
    Agent: [
      { name: 'source', type: 'string' },
      { name: 'connectionId', type: 'bytes32' },
    ],
  };

  return signInner(signer, domain, types, phantomAgent);
};




// Generates a random wallet and connects it to a provider for the specified chain
export const generateAgentWallet = () => {
  // Generate a random wallet
  const wallet = Wallet.createRandom();

  // Set up a provider for the desired chain (e.g., Arbitrum Nova testnet - chainId 421614)
  const provider = new providers.JsonRpcProvider(
    "https://nova.arbitrum.io/rpc", //
    421614 // Chain ID for Arbitrum Nova testnet
  );

  // Connect the wallet to the provider
  const connectedWallet = wallet.connect(provider);

  return {
    address: connectedWallet.address, // Wallet address
    privateKey: connectedWallet.privateKey, // Private key
    provider: connectedWallet.provider, // Provider connected to the wallet
  };
};


