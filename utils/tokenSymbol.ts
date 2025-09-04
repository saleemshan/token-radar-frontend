import { MarketData } from "@/context/webDataContext";

export function findCoinFromMarketDataByCoinId(marketData: MarketData | null, coinId?: string | null) {
  if (!marketData || !coinId) return null;

  const marketEntry = Object.values(marketData).find(
    (entry) => entry.id === coinId,
  );
    return marketEntry || null;
  }


  export function findMarketDataByName(marketData: MarketData | null, name?: string | null) {
    if (!marketData || !name) return null;

    const marketEntry = Object.values(marketData).find(
      (entry) => entry.base === name,
    );
    return marketEntry || null;
  }