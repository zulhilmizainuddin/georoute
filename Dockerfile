FROM node:boron

RUN mkdir -p /app/georoute
WORKDIR /app/georoute

RUN yarn global add bower
COPY bower.json /app/georoute
RUN bower --allow-root install

RUN yarn global add pm2

COPY package.json /app/georoute
RUN yarn install

COPY . /app/georoute

RUN npm run package

EXPOSE 3000

CMD ["pm2-docker", "bin/www"]
