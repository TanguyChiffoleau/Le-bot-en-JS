FROM node:12.18.2

ENV NODE_ENV=production

COPY . .

RUN npm i

CMD npm start
