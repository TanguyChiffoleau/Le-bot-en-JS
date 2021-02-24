FROM node:14.16.0-alpine3.13
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY src/ src/
CMD node .
