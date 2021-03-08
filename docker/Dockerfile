FROM node:14.16.0-alpine3.13
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY --chown=node:node . ./
RUN npm ci --only=production

USER node
CMD ["node", "src/index.js"]
