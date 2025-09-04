type TopInfluencer = {
  lunar_id: string;
  identifier: string;
  network: string;
  value: string;
  name: string;
  display_name: string;
  avatar: string;
  followers: number;
  interactions_1h: number;
  interactions_24h: number;
  interactions_24h_prev: number;
  influencer_rank: number;
};

type LunarCrushChart = {
  config: {
    bucket: string;
    coin: string;
    interval: string;
    start: number;
    end: number;
    ch: number;
    generated: number;
  };
  data: {
    id: number;
    name: string;
    symbol: string;
  };
  timeSeries: IndividualTS[];
};

type IndividualTS = {
  ts: number;
  mentions: number;
  social_dominance: number;
};

type SocialAnalytic = {
  mentionsDifference: number;
  mentionsPercentageChange: number;
  socialDominanceDifference: number;
  socialDominancePercentageChange: number;
  currentMentions: number;
  currentSocialDominance: number;
};
