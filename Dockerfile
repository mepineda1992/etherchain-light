FROM node:8.7.0-onbuild

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install
COPY . .

EXPOSE 3002

CMD [ "npm", "start" ]

# RUN apt-get update -yq \
#     && apt-get install curl gnupg git make g++ -yq \
#     && curl -sL https://deb.nodesource.com/setup_8.x | bash \
#     && apt-get install nodejs -yq

# RUN \
#   git clone --depth=1 https://github.com/puppeth/eth-net-intelligence-api && \
#     cd eth-net-intelligence-api && npm install

