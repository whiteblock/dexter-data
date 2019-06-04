import 'ccxt'

/*

  Requirements

  - Provide a way to ask for candlestick data from an exchange and market and timeframe.
    + If candlesticks of a certain timeframe are not available, try to derive them from smaller timeframes that *are* available.
  - Provide a way to start and stop continuous download of candlesticks for a market.
  - Keep metadata on what markets I have data for.
  - Provide a way to stream candlesticks out to consumers.
    + Optionally, clean the candlestick data if they ask.
  - Wrap all this in a gRPC service.

 */

