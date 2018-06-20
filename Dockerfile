FROM node:8 AS nodebuild

RUN git clone https://github.com/ewasm/ewasm-studio

RUN cd ewasm-studio/app && npm install

WORKDIR "ewasm-studio/app"
ENTRYPOINT ["npm", "run", "start"]
