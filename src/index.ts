import ccxt from 'ccxt';
import Bookshelf from 'bookshelf';
import Knex from 'knex';
import Lazy from 'lazy.js';

/*

  Requirements

  - Provide a way to ask for candlestick data from an exchange and market and timeframe.
    + If candlesticks of a certain timeframe are not available,
      try to derive them from smaller timeframes that *are* available.
  - Provide a way to start and stop continuous download of candlesticks for a market.
  - Keep metadata on what markets I have data for.
  - Provide a way to stream candlesticks out to consumers.
    + Optionally, clean the candlestick data if they ask.
  - Wrap all this in a gRPC service.

 */

function supportedExchanges() {
  return Lazy(ccxt.exchanges)
    .map((name: string) => new ccxt[name]())
    .filter((ex: any) => ex.has['fetchOHLCV'])
    .map((ex: any) => ex.id)
    .toArray()
}

async function supportedMarkets(exchange: string) {
  const ex: any = new ccxt[exchange]();
  const markets = await ex.loadMarkets();
  const symbols = Object.keys(markets);
  return symbols;
}

async function getCandles(exchange: string, market: string, timeframe: string) {
  const ex: any = new ccxt[exchange]();
  const candles: Array<Object> = await ex.fetchOHLCV(market, timeframe);
  return candles
}

async function streamCandles(exchange: string, market: string, timeframe: string) {
}

function archiveMarket(exchange: string, market: string, timeframe: string) {
}

export default {
  Bookshelf,
  Knex,
  ccxt,
  Lazy,
  supportedExchanges,
  supportedMarkets,
  getCandles,
  streamCandles,
  archiveMarket,
};
