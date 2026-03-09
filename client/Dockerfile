FROM node:25-alpine3.22 as builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./


RUN npm ci
COPY . .
# Bundle app source
RUN npm run build


FROM nginx:stable-alpine

WORKDIR /app

COPY --from=builder /app/build /app/html
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /app/run && apk add --no-cache bash && apk add --no-cache curl

EXPOSE 80

CMD ["nginx", "-c", "/etc/nginx/nginx.conf"]