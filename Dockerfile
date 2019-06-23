FROM node:10.16-alpine

WORKDIR /dexter-data

# dependency phase
COPY package.json yarn.lock 
RUN yarn install

