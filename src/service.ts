import grpc from 'grpc';
import * as protoLoader from '@grpc/proto-loader';
import dexterData from './index';

const PROTO_PATH = `${__dirname}/../proto/dexter-data.proto`;
const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    arrays: true,
  },
);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

function unsupported() {
}

function supportedExchanges(call: any, cb: any) {
  const exchanges = dexterData.supportedExchanges();
  cb(null, { exchanges });
}

async function supportedMarkets(call: any, cb: any) {
  const markets = await dexterData.supportedMarkets(call.request.exchange);
  cb(null, { markets });
}

async function getCandles(call: any, cb: any) {
  const {exchange, market, timeframe} = call.request;
  const candles = await dexterData.getCandles(exchange, market, timeframe);
  cb(null, { candles: candles.map((c:any) => { return { timestamp: c[0], o: c[1], h: c[2], l: c[3], c: c[4], v: c[5] }}) })
}

function test(call: any, cb: any) {
  cb(null, { a: 1, b: 2 });
}

function getServer() {
  const server = new grpc.Server();
  const dd: any = protoDescriptor.DexterData;
  const service = dd.service;
  server.addService(service, {
    supportedExchanges,
    supportedMarkets,
    getCandles,
    streamCandles: unsupported,
    test:          test,
  });
  return server;
}

function getClient(bind: string) {
  return new protoDescriptor.DexterData(bind, grpc.credentials.createInsecure());
}

module.exports = {
  packageDefinition,
  protoDescriptor,
  unsupported,
  getServer,
  getClient,
};
