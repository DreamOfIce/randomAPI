FROM docker.io/node:lts-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY . /app/
RUN yarn --registry=https://registry.npmmirror.com
EXPOSE 8006
CMD yarn start
