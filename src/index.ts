import _ccxt from 'ccxt';
import Bookshelf from 'bookshelf';
import Knex from 'knex';
import Lazy from 'lazy.js';
import events, { EventEmitter } from 'events';

const ccxt: any = _ccxt; // a hack to make TypeScript shut up.

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

interface PriceEmitterOptions { // or CandleEmitter
  exchange:        string;
  market:          string;
  updateInterval?: number;
}


class PriceEmitter {
  intervalId:     NodeJS.Timeout | undefined;
  updateInterval: number;
  em:             EventEmitter;
  ex:             any;
  exchange:       string;
  market:         string;
  subscribers:    Array<EventEmitter>;

  constructor(opts: PriceEmitterOptions) {
    this.updateInterval = opts.updateInterval || 10000;
    this.ex = new ccxt[opts.exchange]();
    this.exchange = opts.exchange;
    this.market = opts.market;
    const em = this.em = new EventEmitter();
    this.subscribers = [];
    em.on('price', (candles) => {
      // loop through every subscriber and send them the last 2 1m candles
      this.subscribers.forEach((sub) => {
        sub.emit('price', candles)
      })
    });
  }

  start() {
    this.intervalId = setInterval(async () => {
      try {
        const candles = await this.ex.fetchOHLCV(this.market, '1m', undefined, 2);
        if (candles[1]) {
          this.em.emit('price', candles);
        }
      }
      catch (e) {
        console.warn(e);
      }
    }, this.updateInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined
    }
  }

  addSubscriber(subscriber: EventEmitter) {
    this.subscribers.push(subscriber)
  }
}

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

function createPriceEmitter(exchange: string, market: string, updateInterval: number = 10000): PriceEmitter {
  const em = new PriceEmitter({ exchange, market, updateInterval });
  return em;
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
  createPriceEmitter,
  streamCandles,
  archiveMarket,
};
