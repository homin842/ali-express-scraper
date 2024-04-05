FROM node:20.10.0

WORKDIR /app

COPY . .
RUN yarn install

ARG CACHEBUST
RUN echo CACHEBUST "$CACHEBUST"
COPY .env .

EXPOSE 3000

CMD ["yarn", "start"]
