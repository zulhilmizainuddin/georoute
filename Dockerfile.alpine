FROM node:alpine

RUN mkdir -p /app/georoute
WORKDIR /app/georoute

RUN apk add --update git && \
    yarn global add bower && \
    yarn global add pm2

COPY bower.json /app/georoute
RUN bower --allow-root install

COPY package.json /app/georoute
RUN yarn install

COPY . /app/georoute

RUN npm run package

EXPOSE 3000

CMD ["pm2-docker", "bin/www"]
