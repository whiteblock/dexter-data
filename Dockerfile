FROM node:10.16-stretch

WORKDIR /dexter-data

# sys dependency phase
#RUN apk add --no-cache \
#    gcc \
#    g++ \
#    make \
#    python

# app dependency phase
COPY package.json yarn.lock ./

RUN yarn install

COPY knexfile.js tsconfig.json tslint.json ./
COPY src/ src/
RUN yarn build-dist

ENTRYPOINT /bin/sh
CMD [ "node", "dist/index.js" ]
