FROM node:boron

RUN mkdir -p /app/georoute
WORKDIR /app/georoute

RUN apt-get update && \
    apt-get install -y git traceroute && \
    yarn global add bower && \
    yarn global add pm2

COPY bower.json .
RUN bower --allow-root install

COPY package.json .
RUN yarn install

COPY . .

RUN npm run package

EXPOSE 3000

CMD ["pm2-docker", "bin/www"]