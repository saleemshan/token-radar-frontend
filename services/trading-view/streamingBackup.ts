/* eslint-disable @typescript-eslint/no-explicit-any */
// import { parseFullSymbol } from './helpers';

export const CRUSH_RESOLUSION = {
  1: '1m',
  5: '5m',
  15: '15m',
  60: '1h',
  240: '4h',
  '1D': '1d',
};

export default class SocketClient {
  socket!: WebSocket;
  channelToSubscription!: Map<string, any>;
  intervalMap: Map<string, NodeJS.Timeout>;
  checkConnectionInterval!: NodeJS.Timeout;

  constructor() {
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
      console.log('[SocketClient] init');
    this._createSocket();
    this.intervalMap = new Map();
  }

  _createSocket() {
    this.socket = new WebSocket('wss://stream.dev.xexlab.com/ws');

    this.channelToSubscription = new Map();

    this.socket.addEventListener('open', () => {
      if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
        console.log('[socket] Connected');
      this._startConnectionCheck();
    });

    this.socket.addEventListener('connect', () => {
      if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
        console.log('[socket] Connected');
    });

    this.socket.addEventListener('disconnect', (reason: any) => {
      if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
        console.log('[socket] Disconnected:', reason);
      // clearInterval(this.checkConnectionInterval);
    });

    this.socket.addEventListener('error', (error: any) => {
      if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
        console.log('[socket] Error:', error);
      // clearInterval(this.checkConnectionInterval);
    });

    this.socket.addEventListener('message', ({ data }) => {
      const parsedData = JSON.parse(data);
      if (parsedData.action === 'pong') return;

      //no new token price data
      if (
        !parsedData.data ||
        parsedData.data.length < 1 ||
        !parsedData.data[0].token_price_usd
      )
        return;

      const newTokenPrice = parsedData.data[0].token_price_usd;
      const pairAddress = parsedData.data[0].pair_addr;

      console.log({ pairAddress });

      if (!newTokenPrice || !pairAddress) return;

      const channelString = `${pairAddress.toLowerCase()}`;
      const subscriptionItem = this.channelToSubscription.get(channelString);

      if (subscriptionItem === undefined) {
        return;
      }
      const lastDailyBar = subscriptionItem.lastDailyBar;

      const bar = {
        ...lastDailyBar,
        close: newTokenPrice,
      };

      subscriptionItem.lastDailyBar = { ...bar };

      // Send data to every subscriber of that symbol
      subscriptionItem.handlers.forEach(
        (handler: { callback: (arg0: any) => any }) => handler.callback(bar),
      );
    });
  }

  _startConnectionCheck() {
    this.checkConnectionInterval = setInterval(() => {
      if (this.socket.readyState === WebSocket.OPEN) {
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
          console.log('[socket] Connection is alive');
      } else {
        if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
          console.log('[socket] Connection is not open');
      }
    }, 10000); // Check every 10 seconds
  }

  public subscribeOnStream(
    symbolInfo: TradingView.LibrarySymbolInfo,
    resolution: TradingView.ResolutionString,
    onRealtimeCallback: TradingView.SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void,
    lastDailyBar: TradingView.Bar | undefined,
    pairAddress: string,
    chainWebsocket: number,
  ) {
    const channelString = `${pairAddress.toLowerCase()}`;

    const handler = {
      id: subscriberUID,
      callback: onRealtimeCallback,
    };
    let subscriptionItem = this.channelToSubscription.get(channelString);
    if (subscriptionItem) {
      // Already subscribed to the channel, use the existing subscription
      subscriptionItem.handlers.push(handler);
      return;
    }
    subscriptionItem = {
      subscriberUID,
      resolution,
      lastDailyBar,
      handlers: [handler],
    };
    this.channelToSubscription.set(channelString, subscriptionItem);
    if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
      console.log(
        '[subscribeBars]: Subscribe to streaming. Channel:',
        channelString,
      );

    this.socket.send(
      `{"action":"subscribe","channel":"token_activity","data":{"chain":"${chainWebsocket}","address":"${pairAddress}"}}`,
    );

    //keep connection alive
    const intervalID = setInterval(() => {
      this.emit({
        action: 'ping',
      });
    }, 10000);

    this.intervalMap.set(subscriberUID, intervalID);
  }

  public unsubscribeFromStream(subscriberUID: string) {
    for (const channelString of Array.from(this.channelToSubscription.keys())) {
      const subscriptionItem = this.channelToSubscription.get(channelString);
      const handlerIndex = subscriptionItem.handlers.findIndex(
        (handler: { id: string }) => handler.id === subscriberUID,
      );

      if (handlerIndex !== -1) {
        // Remove from handlers
        subscriptionItem.handlers.splice(handlerIndex, 1);

        const intervalID = this.intervalMap.get(subscriberUID);

        if (intervalID) {
          clearInterval(intervalID);
          this.intervalMap.delete(subscriberUID);
        }

        if (subscriptionItem.handlers.length === 0) {
          // Unsubscribe from the channel if it is the last handler
          if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
            console.log(
              '[unsubscribeBars]: Unsubscribe from streaming. Channel:',
              channelString,
            );

          // this.emit('UNSUBSCRIBE', [channelString], 2);
          this.channelToSubscription.delete(channelString);
          break;
        }
      }
    }
  }

  emit(methodOrPayload: string | object, params?: any, id?: number) {
    if (this.socket.readyState !== WebSocket.OPEN) {
      console.log('[socket] Socket is not open, cannot send message');
      return;
    }

    let payload: string;

    if (typeof methodOrPayload === 'string') {
      // Existing functionality with method, params, and id
      payload = JSON.stringify({
        method: methodOrPayload,
        params,
        id,
      });
    } else {
      // Custom payload
      payload = JSON.stringify(methodOrPayload);
    }

    this.socket.send(payload);
  }
}
