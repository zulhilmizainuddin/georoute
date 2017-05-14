FROM node:boron

RUN mkdir -p /app/georoute
WORKDIR /app/georoute

RUN yarn global add bower
COPY bower.json /app/georoute
RUN bower --allow-root install

COPY package.json /app/georoute
RUN yarn install

COPY . /app/georoute

RUN npm run package

EXPOSE 3000

CMD ["npm", "start"]
