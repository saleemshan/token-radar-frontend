//User balance for specific token address
//GET api/v1/[chain]/wallet/[user_id]/[token_address]
const getTokenBalanceResponse = {
  balance: 10,
};

//Get user trade settings
//GET api/v1/[chain]/wallet/[user_id]/settings
const getTradeSettingsResponse = {
  slippage_limit: 0.5,
  priority_fee: 0.005,
  anti_mev_enabled: true,
};

//Update user trade settings
//PATCH api/v1/[chain]/wallet/[user_id]/settings
const patchTradeSettingsBody = {
  slippage_limit: 0.5,
  priority_fee: 0.005,
  anti_mev_enabled: true,
};

//Buy token
//POST api/v1/[chain]/wallet/[user_id]/buy
const postBuyTokenBody = {
  token_address: '0x123',
  amount: 10,
  slippage_limit: 0.5,
  priority_fee: 0.005,
  anti_mev_enabled: true,
};

//Sell
const postSellTokenBody = {
  token_address: '0x123',
  amount: 10,
  slippage_limit: 0.5,
  priority_fee: 0.005,
  anti_mev_enabled: true,
};
