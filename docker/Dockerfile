FROM node:14.15.0-alpine
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci

COPY src/ src/
CMD node .
