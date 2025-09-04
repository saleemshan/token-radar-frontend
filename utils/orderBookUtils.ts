import { Order } from '@/types/orderbook';
import { getUsdSizeEquivalents } from './usdEquivalents';
import { OrderStep } from './hyperliquid';

export const calculateBarWidth = (total: number, max: number) => {
  return (total / max) * 100;
};

export const calculateSpreadPercentage = (asks: Order[], bids: Order[]) => {
  if (asks.length === 0 || bids.length === 0) return 0;
  const highestBid = bids[0].px;
  const lowestAsk = asks[asks.length - 1].px;
  const spread = lowestAsk - highestBid;
  return parseFloat(((spread / lowestAsk) * 100).toFixed(2));
};

export const calculateTotal = (
  orders: Order[],
  pair: string,
  reverse: boolean = false,
) => {
  let cumulativeTotal = 0;
  const ordersCopy = reverse ? [...orders].reverse() : [...orders];

  const ordersWithTotal = ordersCopy.map((order) => {
    const sizeEquivalent =
      pair?.toUpperCase() === 'USD'
        ? getUsdSizeEquivalents({
            size: order.sz,
            currentMarkPrice: order.px,
            token: pair,
          })
        : order.sz;

    cumulativeTotal += sizeEquivalent;
    return { ...order, total: Number(cumulativeTotal.toFixed(2)) };
  });

  return reverse ? ordersWithTotal.reverse() : ordersWithTotal;
};

export const groupOrdersByStep = (
  orders: Order[],
  step: OrderStep,
): Order[] => {
  const groupedOrders = orders.reduce(
    (acc: { [key: number]: Order }, order) => {
      const roundedPrice = Math.round(order.px / step) * step;

      if (!acc[roundedPrice]) {
        acc[roundedPrice] = { ...order, px: roundedPrice };
      } else {
        acc[roundedPrice].sz += order.sz;
        acc[roundedPrice].n += order.n;
      }

      return acc;
    },
    {},
  );

  return Object.values(groupedOrders);
};
