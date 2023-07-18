# build environment
FROM node:14 as builder

ENV BASEDIR=/usr/src/app

WORKDIR $BASEDIR/
COPY package*.json ./

RUN npm install
RUN npm install pm2 -g
RUN npm rebuild
# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "pm2-runtime", "ecosystem.config.js" ]
