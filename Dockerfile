FROM node:12.18.2

COPY . .

RUN npm i --only=prod

CMD npm start
