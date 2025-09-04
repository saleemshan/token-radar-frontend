// /* eslint-disable @typescript-eslint/no-explicit-any */
// import axios from 'axios';
// import { getDecimalPlacesAndScale } from './helpers';
// import SocketClient, { CRUSH_RESOLUSION } from './streaming';

// const configurationData: TradingView.DatafeedConfiguration = {
//   // Represents the resolutions for bars supported by your datafeed
//   supported_resolutions: [
//     '1',
//     '5',
//     '15',
//     '60',
//     '240',
//     '1D',
//   ] as TradingView.ResolutionString[],

//   // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
//   exchanges: [{ value: 'Crush', name: 'Crush', desc: 'Crush' }],
//   // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
//   symbols_types: [{ name: 'crypto', value: 'crypto' }],
// };

// export interface DataFeedOptions {
//   SymbolInfo?: TradingView.LibrarySymbolInfo;
//   DatafeedConfiguration?: TradingView.DatafeedConfiguration;
//   getBars?: TradingView.IDatafeedChartApi['getBars'];
// }

// export default class DataFeed
//   implements TradingView.IExternalDatafeed, TradingView.IDatafeedChartApi
// {
//   private options: DataFeedOptions;
//   private pairContractAddress: string;
//   private tokenAddress: string;
//   private tokenPrice: number;
//   private tokenMarketCap: number;
//   private chain: Chain;
//   private lastBarsCache: Map<string, TradingView.Bar>;
//   private socket!: SocketClient;
//   private priceBars: TradingView.Bar[] = [];
//   private marketCapBars: TradingView.Bar[] = [];
//   private showPrice: boolean = true;

//   constructor(
//     options: DataFeedOptions,
//     pairContractAddress: string,
//     tokenAddress: string,
//     chain: Chain,
//     tokenPrice: number,
//     tokenMarketCap: number,
//     showPrice: boolean,
//   ) {
//     this.options = options;
//     this.chain = chain;
//     this.tokenAddress = tokenAddress;
//     this.pairContractAddress = pairContractAddress;
//     this.lastBarsCache = new Map();
//     if (!options) {
//       this.options.DatafeedConfiguration = configurationData;
//     }
//     this.showPrice = showPrice;
//     this.tokenPrice = tokenPrice;
//     this.tokenMarketCap = tokenMarketCap;
//   }
//   public async onReady(callback: TradingView.OnReadyCallback) {
//     if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
//       console.log('[onReady]: Method call');
//     setTimeout(() => callback(configurationData));
//     this.socket = new SocketClient();
//   }

//   public async searchSymbols() {
//     // onResultReadyCallback: TradingView.SearchSymbolsCallback, // symbolType: string, // exchange: string, // userInput: string,
//     if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
//       console.log('[searchSymbols]: Method call');
//     // const symbols = await this.getAllSymbols();
//     // const newSymbols = symbols.filter((symbol) => {
//     //   const isExchangeValid = exchange === '' || symbol.exchange === exchange;
//     //   const isFullSymbolContainsInput =
//     //     symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !== -1;
//     //   return isExchangeValid && isFullSymbolContainsInput;
//     // });
//     // onResultReadyCallback(newSymbols);
//   }

//   public async resolveSymbol(
//     symbolName: string,
//     onSymbolResolvedCallback: TradingView.ResolveCallback,
//     // onResolveErrorCallback: TradingView.DatafeedErrorCallback,
//     // extension: TradingView.SymbolResolveExtension,
//   ) {
//     // const symbols = await this.getAllSymbols();
//     // const symbolItem = symbols.find(
//     //   ({ full_name }) => full_name === symbolName,
//     // );
//     // if (!symbolItem) {
//     //   console.log('[resolveSymbol]: Cannot resolve symbol', symbolName);
//     //   onResolveErrorCallback('Cannot resolve symbol');
//     //   return;
//     // }
//     // Symbol information object

//     const price = this.tokenPrice ?? undefined;

//     const { scale } = getDecimalPlacesAndScale(price);

//     const symbolInfo: Partial<TradingView.LibrarySymbolInfo> = {
//       ticker: symbolName,
//       name: symbolName,
//       description: '',
//       type: 'crypto',
//       session: '24x7',
//       timezone: 'Etc/UTC',
//       exchange: 'Crush',
//       minmov: 1, // here
//       pricescale: this.showPrice ? scale : 1, //here
//       has_intraday: true,
//       has_daily: true,
//       has_weekly_and_monthly: false,
//       visible_plots_set: 'ohlcv',
//       supported_resolutions: configurationData.supported_resolutions!,
//       volume_precision: 2,
//       data_status: 'streaming',
//     };
//     if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
//       console.log('[resolveSymbol]: Symbol resolved', symbolName);
//     onSymbolResolvedCallback(symbolInfo as TradingView.LibrarySymbolInfo);
//   }

//   public async getBars(
//     symbolInfo: TradingView.LibrarySymbolInfo,
//     resolution: TradingView.ResolutionString,
//     periodParams: TradingView.PeriodParams,
//     onHistoryCallback: TradingView.HistoryCallback,
//     onErrorCallback: TradingView.DatafeedErrorCallback,
//   ) {
//     const { from, to, firstDataRequest } = periodParams;

//     const urlParameters = {
//       pairCa: this.pairContractAddress,
//       interval: CRUSH_RESOLUSION[resolution as keyof typeof CRUSH_RESOLUSION],
//       startTime: from,
//       endTime: to,
//       limit: 500,
//     };

//     try {
//       const response = await axios.get(
//         `/api/${this.chain.api}/tokens/address/datafeed`,
//         {
//           params: urlParameters,
//         },
//       );

//       const data = response.data.data;
//       if (!data || data.length <= 0) {
//         // "noData" should be set if there is no data in the requested period
//         onHistoryCallback([], { noData: true });
//         return;
//       }

//       const sampleBar = data[0];
//       const result = getDecimalPlacesAndScale(sampleBar.close);

//       let bars: {
//         time: number;
//         low: any;
//         high: any;
//         open: any;
//         close: any;
//         volume: any;
//       }[] = [];
//       data.forEach((bar: KlineData) => {
//         if (bar.timestamp >= from && bar.timestamp < to) {
//           bars = [
//             ...bars,
//             {
//               time: bar.timestamp * 1000,
//               open: parseFloat(bar.open.toFixed(result.decimalPlaces)),
//               high: parseFloat(bar.high.toFixed(result.decimalPlaces)),
//               low: parseFloat(bar.low.toFixed(result.decimalPlaces)),
//               close: parseFloat(bar.close.toFixed(result.decimalPlaces)),
//               volume: parseFloat(bar.volume.toFixed(result.decimalPlaces)),
//             },
//           ];
//         }
//       });
//       if (firstDataRequest) {
//         this.lastBarsCache.set(this.pairContractAddress, {
//           ...bars[bars.length - 1],
//         });
//       }
//       if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
//         console.log(`[getBars]: returned ${bars.length} bar(s)`);

//       this.priceBars = bars;
//       this.marketCapBars = this.priceBars.map((bar) => ({
//         time: bar.time,
//         low: (this.tokenMarketCap / this.tokenPrice) * bar.low,
//         high: (this.tokenMarketCap / this.tokenPrice) * bar.high,
//         open: (this.tokenMarketCap / this.tokenPrice) * bar.open,
//         close: (this.tokenMarketCap / this.tokenPrice) * bar.close,
//         volume: bar.volume,
//       }));

//       if (this.showPrice) {
//         onHistoryCallback(this.priceBars, { noData: false });
//       } else {
//         onHistoryCallback(this.marketCapBars, { noData: false });
//       }
//     } catch (error) {
//       if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
//         console.log('[getBars]: Get error', error);
//       onErrorCallback(error as string);
//     }
//   }

//   public toggleShowPrice() {
//     this.showPrice = !this.showPrice;
//   }

//   public getShowPrice() {
//     return this.showPrice;
//   }

//   public async subscribeBars(
//     symbolInfo: TradingView.LibrarySymbolInfo,
//     resolution: TradingView.ResolutionString,
//     onRealtimeCallback: TradingView.SubscribeBarsCallback,
//     subscriberUID: string,
//     onResetCacheNeededCallback: () => void,
//   ) {
//     if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
//       console.log(
//         '[subscribeBars]: Method call with subscriberUID:',
//         subscriberUID,
//       );
//     this.socket.subscribeOnStream(
//       symbolInfo,
//       resolution,
//       onRealtimeCallback,
//       subscriberUID,
//       onResetCacheNeededCallback,
//       this.lastBarsCache.get(this.pairContractAddress),
//       this.pairContractAddress,
//       this.chain.websocket,
//       this.showPrice,
//       this.tokenMarketCap,
//       this.tokenPrice,
//       // this.lastBarsCache.get(symbolInfo.full_name),
//     );
//   }

//   public async unsubscribeBars(subscriberUID: string) {
//     if (process.env.NEXT_PUBLIC_NODE_ENV === 'development')
//       console.log(
//         '[unsubscribeBars]: Method call with subscriberUID:',
//         subscriberUID,
//       );
//     this.socket.unsubscribeFromStream(subscriberUID);
//   }
// }
