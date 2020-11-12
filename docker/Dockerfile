FROM node:14.15.0-alpine
ENV NODE_ENV=production
WORKDIR /app/

COPY package.json package-lock.json ./
RUN npm ci

COPY src/ src/
CMD node .
