FROM node:8 AS nodebuild

ADD ./app /app

RUN cd /app && npm install

RUN cd /app && npm run build

WORKDIR /app
ENTRYPOINT ["npm", "run", "start"]
