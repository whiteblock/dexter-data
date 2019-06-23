FROM node:10.16-alpine

WORKDIR /dexter-data

# sys dependency phase
RUN apk add --no-cache \
    gcc \
    g++ \
    make \
    python

# app dependency phase
COPY package.json tsconfig.json yarn.lock ./

#COPY . .
RUN yarn install

