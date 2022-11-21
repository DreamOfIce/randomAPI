FROM docker.io/node:lts-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY . /app/
RUN if [ $(yarn) ];then yarn --registry=https://registry.npmmirror.com ; fi
EXPOSE 8006
CMD yarn start print-log
