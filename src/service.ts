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
  },
);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

function unsupported() {
}

function getServer() {
  const server = new grpc.Server();
  const dd: any = protoDescriptor.DexterData;
  const service = dd.service;
  server.addService(service, {
    supportedExchanges: dexterData.supportedExchanges,
    supportedMarkets:   dexterData.supportedMarkets,
    getCandles:         unsupported,
    streamCandles:      unsupported,
  });
  return server;
}

module.exports = {
  packageDefinition,
  protoDescriptor,
  unsupported,
  getServer,
};
