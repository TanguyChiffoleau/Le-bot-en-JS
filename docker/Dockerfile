FROM node:15.14.0-alpine3.13
RUN apk add dumb-init
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --chown=node:node . ./
RUN npm ci --only=production

USER node
CMD ["dumb-init", "node", "src/index.js"]
