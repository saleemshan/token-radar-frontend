type RelayChain = {
  id: number;
  baseChainId: number;
  name: string;
  displayName: string;
  explorerUrl: string;
};

type RelayToken = {
  groupID: string;
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  vmType: string;
  metadata: {
    logoURI: string;
    verified: boolean;
    isNative: boolean;
  };
};

type BridgeSelectType = 'chain' | 'token';

type BridgeSelectTarget = 'from' | 'to';

interface TransactionData {
  from: string;
  to: string;
  data: string;
  value: string;
  chainId: number;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}

interface StepItem {
  status: 'incomplete' | 'complete' | 'failed';
  data: TransactionData;
  check?: {
    endpoint: string;
    method: string;
  };
}

interface Step {
  id: string;
  action: string;
  description: string;
  kind: string;
  requestId: string;
  items: StepItem[];
}

interface CurrencyMetadata {
  logoURI: string;
  verified: boolean;
  isNative: boolean;
}

interface Currency {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  metadata: CurrencyMetadata;
}

interface FeeAmount {
  currency: Currency;
  amount: string;
  amountFormatted: string;
  amountUsd: string;
  minimumAmount: string;
}

interface Fees {
  gas: FeeAmount;
  relayer: FeeAmount;
  relayerGas: FeeAmount;
  relayerService: FeeAmount;
  app: FeeAmount;
}

interface CurrencyDetail {
  currency: Currency;
  amount: string;
  amountFormatted: string;
  amountUsd: string;
  minimumAmount: string;
}

interface Impact {
  usd: string;
  percent: string;
}

interface SlippageTolerance {
  origin: {
    usd: string;
    value: string;
    percent: string;
  };
  destination: {
    usd: string;
    value: string;
    percent: string;
  };
}

interface Details {
  operation: string;
  sender: string;
  recipient: string;
  currencyIn: CurrencyDetail;
  currencyOut: CurrencyDetail;
  totalImpact: Impact;
  swapImpact: Impact;
  rate: string;
  slippageTolerance: SlippageTolerance;
  timeEstimate: number;
  userBalance: string;
}

export interface BridgeQuoteResponse {
  steps: Step[];
  fees: Fees;
  details: Details;
}
